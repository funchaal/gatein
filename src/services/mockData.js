export const appointmentsAPICall = async (userId) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                data: {
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
                                    operation_type: 'CONTAINER_IMPORT',
                                    title: 'Importação de Container',
                                    // NOVA ESTRUTURA: card_layout
                                    card_layout: {
                                        header: { 
                                            label: 'Container', 
                                            key: 'unit_id' 
                                        },
                                        sub_header: { 
                                            label: 'Placa', 
                                            key: 'plate' 
                                        },
                                        body_rows: [
                                            { label: 'Navio', key: 'vessel_name' },
                                            { label: 'Booking', key: 'booking' }
                                        ]
                                    },
                                    // NOVA ESTRUTURA: modal_layout
                                    modal_layout: [
                                        { 
                                            type: 'alert', 
                                            color: 'red', 
                                            icon: 'hand-right', 
                                            key: 'block_reason',
                                            title: 'Entrada Bloqueada' 
                                        },
                                        { 
                                            type: 'alert', 
                                            color: 'blue', 
                                            icon: 'information-circle', 
                                            key: 'gate_instruction'
                                        },
                                        // { type: 'section', title: 'Acesso' },
                                        { type: 'section', title: 'Dados da Carga' },
                                        { type: 'field', label: 'Peso Bruto', key: 'gross_weight' },
                                        { type: 'field', label: 'Lacre', key: 'seal_number' },
                                        { type: 'field', label: 'Temperatura', key: 'temp_setting' }, 
                                        {
                                            type: 'qrcode',
                                            title: 'Autorização de Entrada',
                                            caption: 'Aproxime do leitor no Gate 3',
                                            key: 'gate_pass_token'
                                        },
                                    ],
                                    actions: [
                                        { id: 'checkin', label: 'Check-in', type: 'primary' }
                                    ]
                                },
                                {
                                    id: 102,
                                    operation_type: 'CONTAINER_EXPORT',
                                    title: 'Exportação de Container',
                                    card_layout: {
                                        header: { 
                                            label: 'Container', 
                                            key: 'unit_id' 
                                        },
                                        sub_header: { 
                                            label: 'Placa', 
                                            key: 'plate' 
                                        },
                                        body_rows: [
                                            { label: 'Transportadora', key: 'carrier_name' },
                                            { label: 'Destino', key: 'destination_port' }
                                        ]
                                    },
                                    modal_layout: [
                                        { 
                                            type: 'alert', 
                                            color: 'green', 
                                            icon: 'check-circle', 
                                            key: 'clearance_status',
                                            title: 'Status Liberação'
                                        },
                                        { type: 'section', title: 'Informações de Carga' },
                                        { type: 'field', label: 'Peso', key: 'gross_weight' },
                                        { type: 'field', label: 'Tipo', key: 'cargo_type' },
                                        // { type: 'section', title: 'Acesso' },
                                        {
                                            type: 'qrcode',
                                            title: 'Gate Pass',
                                            caption: 'Apresente na portaria',
                                            key: 'gate_pass_token'
                                        }
                                    ]
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
                                    operation_type: 'DEFAULT',
                                    title: 'Acesso Geral',
                                    card_layout: {
                                        header: { 
                                            label: 'Veículo', 
                                            key: 'plate' 
                                        },
                                        body_rows: [
                                            { label: 'Portão', key: 'gate_assignment' },
                                            { label: 'Motorista', key: 'driver_name' }
                                        ]
                                    },
                                    modal_layout: [
                                        { 
                                            type: 'alert', 
                                            color: 'blue', 
                                            icon: 'information', 
                                            key: 'access_instructions'
                                        },
                                        { type: 'section', title: 'Dados do Acesso' },
                                        { type: 'field', label: 'Motorista', key: 'driver_name' },
                                        { type: 'field', label: 'Portão', key: 'gate_assignment' },
                                        {
                                            type: 'qrcode',
                                            title: 'Passe de Entrada',
                                            caption: 'Apresente este código na entrada',
                                            key: 'gate_pass_token'
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    appointments: [
                        {
                            id: '1',
                            terminalId: 1,
                            operation_type: 'CONTAINER_IMPORT',
                            status: 'Agendado',
                            booking: 'DPW-9090',
                            schedule_start_time: '2024-10-21 14:00',
                            // custom_data contém os campos dinâmicos
                            custom_data: {
                                unit_id: 'TCLU1234567888',
                                plate: 'NZR-7854',
                                vessel_name: 'MSC VIVIANA',
                                booking: 'MSCU8745123',
                                gross_weight: '28.500 kg',
                                seal_number: 'SL789456',
                                temp_setting: '-18°C',
                                gate_instruction: 'Dirija-se ao Gate 3 - Pista A após o check-in',
                                gate_pass_token: 'DPWS-2024-001-9090'
                            }
                        },
                        {
                            id: '2',
                            terminalId: 1,
                            operation_type: 'CONTAINER_EXPORT',
                            status: 'No Pátio',
                            booking: 'DPW-9091',
                            schedule_start_time: '2024-10-21 16:30',
                            custom_data: {
                                unit_id: 'MSCU9876543',
                                plate: 'ABC-1234',
                                carrier_name: 'Transportadora Santos Ltda',
                                destination_port: 'Rotterdam, NL',
                                gross_weight: '24.800 kg',
                                cargo_type: 'Dry',
                                clearance_status: 'Liberado pela Receita Federal',
                                gate_pass_token: 'DPWS-2024-001-9091'
                            }
                        },
                        {
                            id: '3',
                            terminalId: 2,
                            operation_type: 'DEFAULT',
                            status: 'Agendado',
                            booking: 'BTP-5502',
                            schedule_start_time: '2024-10-21 18:00',
                            custom_data: {
                                plate: 'XYZ-9876',
                                driver_name: 'João Silva',
                                gate_assignment: 'Portão B - Pista 3',
                                access_instructions: 'Acesso liberado. Siga a sinalização após o portão.',
                                gate_pass_token: 'BTP-2024-003-5502'
                            }
                        },
                        {
                            id: '4',
                            terminalId: 1,
                            operation_type: 'CONTAINER_IMPORT',
                            status: 'Expirado',
                            booking: 'DPW-8888',
                            schedule_start_time: '2024-10-20 10:00',
                            custom_data: {
                                unit_id: 'HLBU2233445',
                                plate: 'DEF-5678',
                                vessel_name: 'CMA CGM BAHIA',
                                booking: 'CMAU5566778',
                                block_reason: 'Agendamento expirado. Reagende na plataforma.',
                                gross_weight: '22.100 kg',
                                seal_number: 'SL123987'
                            }
                        }
                    ]
                }
            });
        }, 1500);
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

export const mockLogin = (tax_id, password, device) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Login attempt:', { tax_id, device });

      // Caso 1: Sucesso
      if (tax_id === '43316667865' && password === '123456') {
        resolve({
          status: 200,
          data: {
            success: true,
            data: {
              token: 'mock_jwt_token_' + Date.now(),
              user: {
                id: 1,
                name: 'Rafael Motorista',
                tax_id: '199.264.438-18',
                driver_license: '1234567890',
                driver_id: 'DRV-001',
              },
            },
          },
        });
      }
      // Caso 2: Usuário não encontrado
      else if (tax_id === '03596167477') {
        reject({
          response: {
            status: 404,
            data: {
              success: false,
              error: {
                code: 'USER_NOT_FOUND',
                message: 'Usuário não encontrado',
              },
            },
          },
        });
      }
      // Caso 3: Senha inválida (tax_id correto)
      else if (tax_id === '43316667865') {
        reject({
          response: {
            status: 401,
            data: {
              success: false,
              error: {
                code: 'PASSWORD_INVALID',
                message: 'Senha incorreta',
              },
            },
          },
        });
      }
      // Caso 4: Dispositivo não validado
      else if (tax_id === '19926443818') {
        reject({
          response: {
            status: 403,
            data: {
              success: false,
              error: {
                code: 'DEVICE_NOT_VALIDATED',
                message: 'Dispositivo não autorizado. Entre em contato com o suporte.',
              },
            },
          },
        });
      }
      // Default: Senha inválida
      else {
        reject({
          response: {
            status: 401,
            data: {
              success: false,
              error: {
                code: 'PASSWORD_INVALID',
                message: 'Senha incorreta',
              },
            },
          },
        });
      }
    }, 1500);
  });
};

/**
 * Mock para restaurar sessão
 * Rota: POST /api/v1/auth/session/restore
 */
export const mockRestoreSession = (token, device) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const isTokenValid = true; // Mude para false para testar sessão expirada
      const isSessionActive = true; // Simula verificação no Redis

      if (isTokenValid && isSessionActive) {
        resolve({
          data: {
            success: true,
            data: {
              user: {
                id: 1,
                tax_id: '433.166.678-65',
                name: 'Rafael Motorista',
                driver_id: 'DRV-001',
                role: 'driver',
                driver_license: '1234567890',
              },
            },
          },
        });
      } else {
        reject({
          response: {
            status: 401,
            data: {
              success: false,
              error: {
                code: 'JWT_TOKEN_INVALID',
                message: 'Sessão expirada. Faça login novamente.',
              },
            },
          },
        });
      }
    }, 1500);
  });
};


export const registerTaxId = async (tax_id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (tax_id === '19926443818') {
        // Scenario 1: User is already registered.
        resolve({ data: { success: true, user: { register_step: "registered" }} });
      } else if (tax_id === '03596167477') {
        // Scenario 2: User has a registration in progress.
        resolve({
          data: {
            success: true,
            user: { register_step: 'driver_license', name: 'Jor***o ** Pn**' }
          }
        });
      } else {
        // Scenario 3: New user.
        resolve({
          data: {
            success: true,
            user: { register_step: 'new' } 
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
      resolve({ data: { success: true }});
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
            user: { id: 'mock-user-id', tax_id, name, phone } ,
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