export const THEME = {
    slate900: '#0F172A', // Texto Principal / Placa
    slate600: '#475569', // Texto Secundário / Data
    slate400: '#94A3B8', // Labels / Ícones / ID
    slate100: '#F1F5F9', // Fundo de detalhes / Hover
    border:   '#E2E8F0', // Borda sutil
    white:    '#FFFFFF',
};

export const DEFAULT_TRIP_LAYOUT = {
    card_layout: {
        header: { label: "Resumo", field: "summary" },
        sub_header: { label: "Viagem", field: "ref" },
        status_tags: [
            { value: "PLANNED", color: "blue" },
            { value: "IN_PROGRESS", color: "yellow" },
            { value: "COMPLETED", color: "green" },
            { value: "ON_GOING", color: "yellow" },
            { value: "ACTIVE", color: "blue" },
            { value: "CHECKED-IN", color: "green" }
        ],
        body_rows: [
            { label: "Placa", field: "license_plate" },
            { label: "Origem", field: "origin_city" },
            { label: "Destino", field: "destination_city" }
        ]
    },
    modal_layout: [
        {
            element: "section",
            title: "Detalhes da Viagem",
            fields: [
                { label: "Resumo", field: "summary" },
                { label: "Placa", field: "license_plate" },
                { label: "Origem", field: "origin_city" },
                { label: "Destino", field: "destination_city" }
            ]
        },
        {
            element: "section",
            title: "Carga e Cliente",
            fields: [
                { label: "Tipo de Carga", field: "cargo_type" },
                { label: "Peso da Carga", field: "cargo_weight" },
                { label: "Cliente", field: "customer_name" }
            ]
        },
        { element: "alert", title: "Instruções Especiais", field: "carrier_notes", color: "yellow", icon: "warning" }
    ]
};

export const DEFAULT_APPOINTMENT_LAYOUT = {
    card_layout: {
        header: { label: "Motorista", field: ["driver_name", "driver_tax_id"] },
        sub_header: { label: "Senha", field: "booking" },
        status_tags: [],
        body_rows: [
            { label: "Placa", field: ["plate", "license_plate"] },
            { label: "Conteiner", field: ["container", "container_number"] }
        ]
    },
    modal_layout: [
        {
            element: "section",
            title: "Informações Básicas",
            fields: [
                { label: "Motorista", field: "driver_name" },
                { label: "CPF Motorista", field: "driver_tax_id" },
                { label: "Senha/Booking", field: "booking" },
                { label: "Placa", field: "plate" }
            ]
        }
    ]
};

