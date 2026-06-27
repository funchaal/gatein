/**
 * useFuzzyFilter
 *
 * Hook que filtra um array de objetos usando:
 *  1. extraFilters  — filtros estruturados
 *  2. Levenshtein   — busca fuzzy em todos os campos (inclusive aninhados)
 *
 * Lógica de extraFilters:
 *   - Campos dentro do mesmo objeto → AND  (todos precisam passar)
 *   - Objetos diferentes no array   → OR   (basta um objeto passar)
 *
 * Lógica de busca fuzzy:
 *   - Calcula a menor distância de Levenshtein entre searchText e
 *     qualquer valor primitivo encontrado recursivamente no objeto.
 *   - Retorna SEMPRE ao menos `minResults` itens com menor distância,
 *     evitando resultado vazio.
 *
 * @param {object}   options
 * @param {object[]} options.data          - Array de objetos a filtrar
 * @param {string}   options.searchText    - Texto de busca fuzzy
 * @param {object[]} [options.extraFilters=[]] - Grupos de filtros estruturados
 * @param {number}   [options.minResults=2]   - Mínimo de resultados garantidos
 * @param {number}   [options.maxDistance]    - Limiar máximo de distância Levenshtein
 * @returns {object[]} Array filtrado e ordenado por relevância
 *
 * Exemplo de extraFilters:
 *   [
 *     { role: (v) => v === 'admin', createdAt: (v) => new Date(v).getMonth() === 9 },
 *     { id: (v) => v === 4 },
 *   ]
 */

import { useMemo } from 'react';

// ---------------------------------------------------------------------------
// Levenshtein
// ---------------------------------------------------------------------------

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;

  if (a === b) return 0;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array(n + 1);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + cost,
      );
    }
    [prev, curr] = [curr, prev];
  }

  return prev[n];
}

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------

/** Coleta todos os valores primitivos de um objeto, inclusive aninhados. */
function collectLeaves(value, acc = []) {
  if (value === null || value === undefined) return acc;

  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      value.forEach((v) => collectLeaves(v, acc));
    } else {
      Object.values(value).forEach((v) => collectLeaves(v, acc));
    }
  } else {
    acc.push(String(value).toLowerCase());
  }

  return acc;
}

/**
 * Distância entre needle e uma folha.
 * Se a folha contém needle como substring → 0.
 * Para folhas longas, usa janela deslizante do tamanho do needle.
 */
function leafDistance(leaf, needle) {
  if (leaf.includes(needle)) return 0;

  if (leaf.length > needle.length * 3) {
    let windowMin = Infinity;
    for (let i = 0; i <= leaf.length - needle.length; i++) {
      const d = levenshtein(needle, leaf.slice(i, i + needle.length));
      if (d < windowMin) windowMin = d;
      if (windowMin === 0) return 0;
    }
    return windowMin;
  }

  return levenshtein(needle, leaf);
}

/** Retorna a menor distância de Levenshtein entre needle e qualquer folha do item. */
function minLevenshteinDistance(item, needle) {
  const leaves = collectLeaves(item);
  if (leaves.length === 0) return Infinity;

  let min = Infinity;
  for (const leaf of leaves) {
    const d = leafDistance(leaf, needle);
    if (d < min) min = d;
    if (min === 0) break;
  }
  return min;
}

// ---------------------------------------------------------------------------
// extraFilters
// ---------------------------------------------------------------------------

/** Avalia um grupo (AND): todos os predicados do objeto devem retornar true. */
function evaluateGroup(item, group) {
  return Object.entries(group).every(([key, predicate]) => {
    if (typeof predicate !== 'function') return true;
    return predicate(item[key], item);
  });
}

/** Avalia todos os grupos (OR): basta um grupo passar. */
function passesExtraFilters(item, extraFilters) {
  if (!extraFilters || extraFilters.length === 0) return true;
  return extraFilters.some((group) => evaluateGroup(item, group));
}

// ---------------------------------------------------------------------------
// Hook principal
// ---------------------------------------------------------------------------

export function useFuzzyFilter({
  data,
  searchText,
  extraFilters = [],
  minResults = 2,
  maxDistance,
  gapThreshold = 1,
}) {
  return useMemo(() => {
    // 1. Aplica extraFilters
    const afterStructured =
      extraFilters.length > 0
        ? data.filter((item) => passesExtraFilters(item, extraFilters))
        : data;

    // 2. Sem texto de busca → retorna só o resultado dos filtros estruturados
    const needle = (searchText ?? '').trim().toLowerCase();
    if (!needle) return afterStructured;

    // Limiar padrão: metade do comprimento do needle, mínimo 3
    const threshold =
      maxDistance !== undefined
        ? maxDistance
        : Math.max(3, Math.floor(needle.length / 2));

    // 3. Calcula distância para cada item e ordena do mais próximo ao mais longe
    const scored = afterStructured.map((item) => ({
      item,
      distance: minLevenshteinDistance(item, needle),
    }));

    scored.sort((a, b) => a.distance - b.distance);

    // 4. Filtra os que estão dentro do limiar
    const withinThreshold = scored.filter((s) => s.distance <= threshold);

    // 5. Garante pelo menos `minResults` resultados para evitar lista vazia
    const candidates =
      withinThreshold.length >= minResults
        ? withinThreshold
        : scored.slice(0, Math.max(minResults, withinThreshold.length));

    // 6. Corte por gap: se a diferença entre a menor distância e a próxima
    //    for maior que `gapThreshold` (padrão 2), mantém só os itens com
    //    a menor distância.
    const trimmed = (() => {
      if (candidates.length <= 1) return candidates;
      const minDist = candidates[0].distance;
      const nextDist = candidates[1].distance;
      if (nextDist - minDist > gapThreshold) {
        return candidates.filter((s) => s.distance === minDist);
      }
      return candidates;
    })();

    return trimmed.map((s) => s.item);
  }, [data, searchText, extraFilters, minResults, maxDistance, gapThreshold]);
}


// ---------------------------------------------------------------------------
// Exemplo de uso
// ---------------------------------------------------------------------------
/*
import React, { useState } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';
import { useFuzzyFilter } from './useFuzzyFilter';

const people = [
  { id: 1, name: 'Ana Silva',   role: 'admin', createdAt: '2024-10-15', address: { city: 'São Paulo' } },
  { id: 2, name: 'Bruno Costa', role: 'user',  createdAt: '2024-10-22', address: { city: 'Rio de Janeiro' } },
  { id: 3, name: 'Carla Melo',  role: 'admin', createdAt: '2024-11-01', address: { city: 'Curitiba' } },
  { id: 4, name: 'Diego Ramos', role: 'user',  createdAt: '2024-10-05', address: { city: 'Fortaleza' } },
];

export default function App() {
  const [search, setSearch] = useState('');

  const filtered = useFuzzyFilter({
    data: people,
    searchText: search,
    extraFilters: [
      // Grupo 1 (AND): admin criado em outubro
      {
        role: (v) => v === 'admin',
        createdAt: (v) => new Date(v).getMonth() === 9, // getMonth() é 0-based → 9 = outubro
      },
      // Grupo 2 (OR): OU qualquer item com id 4
      { id: (v) => v === 4 },
    ],
    minResults: 2,
  });

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar..."
        style={{ borderWidth: 1, padding: 8, marginBottom: 12, borderRadius: 6 }}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Text>{item.name} — {item.role} — {item.address.city}</Text>
        )}
      />
    </View>
  );
}
*/