

// --- SIMULAÇÃO DA API (MOCK) ---
// Em produção, isso seria um `axios.get('/dashboard')`
export const appointmentsAPICall = async (userId) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                data: {
                    // Dados que seriam analisados e retornados pelo Back-end
                    terminals: [
                        {
                            id: 1,
                            name: 'DP World - Santos',
                            latitude: -23.91160956216094,
                            longitude: -46.31284453534403,
                            address: 'Av. Eng. Fábio Roberto Barnabé, 1500',
                            geofenceRadius: 1000,
                            appointmentsConfig: [
                                {
                                    id: 101,
                                    type: 'CONTAINER_LOAD',
                                    title: 'Carga de Contêiner',
                                    main: {
                                        h1: { label: 'Container', key: 'cargo_summary', showLabel: true, position: 'above', style: { fontWeight: 'bold', fontSize: '24', color: '#0F172A' } },
                                        h2: { label: 'Placa', key: 'license_plate', showLabel: true, position: 'above', style: { fontSize: '16', color: '#64748B' } },
                                        details: [{ key: 'carrier_name', label: 'Transportadora', showLabel: true }]
                                    },
                                    popup: [{ key: 'carrier_name', label: 'Transp.', showLabel: true }],
                                    actions: [{ id: 'checkin', label: 'Check-in', type: 'primary' }]
                                }
                            ]
                        },
                        {
                            id: 2,
                            name: 'Brasil Terminal Portuário',
                            latitude: -23.924156643454374,
                            longitude: -46.34930933223951,
                            address: 'Av. Eduardo Guinle, s/n',
                            geofenceRadius: 500,
                            appointmentsConfig: [
                                {
                                    id: 201,
                                    type: 'DEFAULT',
                                    title: 'Acesso Geral',
                                    main: {
                                        h1: { label: 'Veículo', key: 'license_plate', showLabel: true, style: { fontWeight: '800', fontSize: '26' } },
                                        details: [{ key: 'gate_assignment', label: 'Dirija-se para', showLabel: true }]
                                    },
                                    popup: [{ key: 'driver_name', label: 'Motorista', showLabel: false }]
                                }
                            ]
                        }
                    ],
                    appointments: [
                        {
                            id: '1',
                            terminalId: 1,
                            type: 'CONTAINER_LOAD',
                            status: 'Agendado',
                            booking_number: 'DPW-9090',
                            license_plate: 'NZR-7854',
                            driver_name: 'Rafael Silva',
                            start_time: '2024-10-21 14:00',
                            window_start: '2024-10-21 14:00',
                            carrier_name: 'Cooperativa Santista',
                            cargo_summary: '40\' Dry HC'
                        },
                        {
                            id: '2',
                            terminalId: 2,
                            type: 'DEFAULT',
                            status: 'No Pátio',
                            booking_number: 'BTP-5502',
                            license_plate: 'NZR-7854',
                            driver_name: 'Rafael Silva',
                            start_time: '2024-10-21 16:30',
                            gate_assignment: 'Portão B - Pista 3'
                        }
                    ]
                }
            });
        }, 1500); // 1.5s de delay para simular rede
    });
};

export const chatsAPICall = async (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          channels: {
            byId: {
              chan_0001: {
                id: 'chan_0001',
                replier_id: 'terminal_01',
                replier_name: 'DP World - Santos',
                replier_avatar: null,
                replier_type: 'terminal',
                unreadCount: 0,
                messageIds: ['msg_001', 'msg_002'],
                lastMessageId: 'msg_002'
              },
              chan_0002: {
                id: 'chan_0002',
                replier_id: 'terminal_02',
                replier_name: 'Brasil Terminal Portuário',
                replier_avatar: null,
                replier_type: 'terminal',
                unreadCount: 2,
                messageIds: ['msg_101', 'msg_102'],
                lastMessageId: 'msg_102'
              }
            },
            allIds: ['chan_0001', 'chan_0002']
          },

          messages: {
            byId: {
              msg_001: {
                id: 'msg_001',
                channelId: 'chan_0001',
                text: 'Olá, estou com dúvidas sobre meu agendamento.',
                sender_id: 'driver',
                timestamp: '2024-10-20T14:30:00Z',
                status: 'sent',
                type: 'text',
                read: true
              },
              msg_002: {
                id: 'msg_002',
                channelId: 'chan_0001',
                text: 'Claro, em que posso ajudar?',
                sender_id: 'terminal',
                timestamp: '2024-10-20T14:32:00Z',
                status: 'sent',
                type: 'text',
                read: true
              },
              msg_101: {
                id: 'msg_101',
                channelId: 'chan_0002',
                text: 'Meu acesso foi negado no portão.',
                sender_id: 'driver',
                timestamp: '2024-10-19T09:15:00Z',
                status: 'sent',
                type: 'text',
                read: false
              },
              msg_102: {
                id: 'msg_102',
                channelId: 'chan_0002',
                text: 'Verificamos aqui, tudo está correto no sistema.',
                sender_id: 'terminal',
                timestamp: '2024-10-19T09:20:00Z',
                status: 'sent',
                type: 'text',
                read: false
              }
            },
            allIds: ['msg_001', 'msg_002', 'msg_101', 'msg_102']
          }
        }
      })
    }, 1500); // 1.5s delay
  });
}

// Esse arquivo simula as respostas que o seu servidor Python/Node daria.
// Útil para testar loading states, erros e fluxo sem internet.

export const mockLogin = (tax_id, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Caso 1: Sucesso
      if (tax_id === '43316667865' && password === '123456') {
        resolve({
          status: 200,
          data: {
            success: true,
            user: {
              id: 1,
              name: 'Rafael Motorista',
              tax_id: '199.264.438-18',
              role: 'driver',
              cnh: '1234567890',
            },
          },
        });
      // Caso 2: Usuário não encontrado
      } else if (tax_id === '03596167477') {
        reject({
          response: {
            status: 404,
            data: {
              success: false,
              error: { code: 'USER_NOT_FOUND', message: null },
            },
          },
        });
      // Caso 3: Senha inválida
      } else if (tax_id === '43316667865') {
        reject({
          response: {
            status: 401,
            data: {
              success: false,
              error: { code: 'PASSWORD_INVALID', message: 'Senha incorreta' },
            },
          },
        });
      // Caso 4: Dispositivo não validado
      } else if (tax_id === '19926443818') {
        reject({
          response: {
            status: 403,
            data: {
              success: false,
              error: { code: 'DEVICE_NOT_VALIDATED', message: null },
            },
          },
        });
      } else {
        // Default: Senha inválida para qualquer outro caso
        reject({
          response: {
            status: 401,
            data: {
              success: false,
              error: { code: 'PASSWORD_INVALID', message: 'Senha incorreta' },
            },
          },
        });
      }
    }, 1500); // Delay para simular a rede
  });
};

export const mockValidateToken = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simula 90% de chance de sucesso e 10% de chance do token ter expirado
      // Mude para false para testar o logout automático
      const isTokenValid = true; 

      if (isTokenValid) {
        resolve({
          data: {
            id: 1,
            name: 'Rafael Motorista',
            tax_id: '123.456.789-00',
            role: 'driver',
            cnh: '1234567890',
          },
        });
      } else {
        // Simula token expirado (o app deve deslogar)
        reject({
          response: { status: 401 },
        });
      }
    }, 1500); // 1.5s simulando latência de rede na estrada
  });
};


export const registerTaxId = async (tax_id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (tax_id === '19926443818') {
        // Scenario 1: User is already registered.
        resolve({ data: { success: true, register_step: "registered" } });
      } else if (tax_id === '03596167477') {
        // Scenario 2: User has a registration in progress.
        resolve({
          data: {
            success: true,
            data: { user: { register_step: 'driver_license', name: 'Jor***o ** Pn**' } }
          }
        });
      } else {
        // Scenario 3: New user.
        resolve({
          data: {
            success: true,
            data: { user: { register_step: 'new' } }
          }
        });
      }
    }, 1000);
  });
};

export const deleteRegistration = async (tax_id) => {
  return new Promise((resolve) => {
    console.log(`Mock API: Deleting registration for ${tax_id}`);
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
};

export const sendPhoneValidationCode = async (tax_id, name, phone) => {
  return new Promise((resolve) => {
    console.log(`Mock API: Sending validation code for ${tax_id}, ${name}, ${phone}`);
    setTimeout(() => {
      // Simulates sending the code. The backend handles the logic.
      resolve({ data: { success: true } });
    }, 1500);
  });
};

export const checkPhoneValidationCode = async (tax_id, name, phone, code) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (code === '1111') {
        // Scenario: Invalid code
        reject({ code: 'PHONE_VALIDATION_CODE_INVALID', message: 'Código inválido.' });
      } else if (code === '2222') {
        // Scenario: Mismatch
        reject({ code: 'TAX_ID_AND_PHONE_MISMATCH', message: 'Código incorreto.' });
      } else {
        // Scenario: Success
        console.log(`Mock API: Code ${code} is valid for ${tax_id}`);
        resolve({
          data: {
            success: true,
            data: { user: { id: 'mock-user-id', tax_id, name, phone } },
            message: null
          },
        });
      }
    }, 1500);
  });
};

export const validateDriverLicense = async (tax_id, driver_license, device) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(`Mock API: Validating DL#${driver_license} for tax_id ${tax_id} on device ${device}`);
      if (driver_license === '111111') {
        // Scenario: Mismatch
        reject({ code: 'DRIVER_LICENSE_NUMBER_MISMATCH', message: 'Número da CNH não corresponde.' });
      }
      else if (driver_license === '222222') {
        // Scenario: Not found
        reject({ code: 'DRIVER_LICENSE_NUMBER_PENDING_VALIDATION', message: 'Número da CNH não existe.' });
      } else {
        // Scenario: Success
        resolve({ data: { success: true, message: null } });
      }
    }, 1500);
  });
};