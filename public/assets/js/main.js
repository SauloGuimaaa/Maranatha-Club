document.addEventListener('DOMContentLoaded', function() {
    // ========== CONTROLE DO FORMULÁRIO ==========
    const petvipForm = document.getElementById('petvipForm');
    
    if (petvipForm) {
        // Elementos do formulário
        const nomeInput = document.getElementById('nome');
        const emailInput = document.getElementById('email');
        const telefoneInput = document.getElementById('telefone');
        const feedbackDiv = document.createElement('div');
        
        // Configura elementos dinâmicos
        feedbackDiv.className = 'form-feedback';
        feedbackDiv.setAttribute('role', 'alert');
        petvipForm.appendChild(feedbackDiv);
        
        // Máscara de telefone
        if (telefoneInput) {
            telefoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 11) value = value.substring(0, 11);
                
                // Formatação: (00) 00000-0000
                if (value.length > 2) {
                    value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
                }
                if (value.length > 10) {
                    value = `${value.substring(0, 10)}-${value.substring(10)}`;
                }
                
                e.target.value = value;
            });
            
            // Adiciona validação de telefone
            telefoneInput.addEventListener('blur', validateTelefone);
        }
        
        // Validação em tempo real
        if (nomeInput) nomeInput.addEventListener('blur', validateNome);
        if (emailInput) emailInput.addEventListener('blur', validateEmail);
        
        // Funções de validação
        function validateNome() {
            const nomeGroup = nomeInput.closest('.form-group');
            if (!nomeGroup) return false;
        
            let errorMsg = nomeGroup.querySelector('.error-message');
            if (!errorMsg) {
                errorMsg = document.createElement('small');
                errorMsg.className = 'error-message';
                nomeGroup.appendChild(errorMsg);
            }
        
            if (nomeInput.value.trim().length < 3) {
                nomeGroup.classList.add('error');
                errorMsg.textContent = 'Por favor, insira seu nome completo';
                return false;
            } else {
                nomeGroup.classList.remove('error');
                errorMsg.textContent = '';
                return true;
            }
        }
        
        function validateEmail() {
            const emailGroup = emailInput.closest('.form-group');
            if (!emailGroup) return false;
            
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (!re.test(emailInput.value.trim())) {
                emailGroup.classList.add('error');
                const errorMsg = emailGroup.querySelector('.error-message');
                if (errorMsg) errorMsg.textContent = 'Por favor, insira um e-mail válido';
                return false;
            } else {
                emailGroup.classList.remove('error');
                return true;
            }
        }
        
        function validateTelefone() {
            const telefoneGroup = telefoneInput.closest('.form-group');
            if (!telefoneGroup) return false;
            
            const value = telefoneInput.value.replace(/\D/g, '');
            if (value.length < 10 || value.length > 11) {
                telefoneGroup.classList.add('error');
                const errorMsg = telefoneGroup.querySelector('.error-message');
                if (errorMsg) errorMsg.textContent = 'Por favor, insira um telefone válido';
                return false;
            } else {
                telefoneGroup.classList.remove('error');
                return true;
            }
        }
        
        function showFeedback(message, type) {
            feedbackDiv.textContent = message;
            feedbackDiv.className = 'form-feedback';
            feedbackDiv.classList.add(type);
            feedbackDiv.setAttribute('aria-live', 'polite');
            
            // Rolagem suave para o feedback
            feedbackDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            setTimeout(() => {
                feedbackDiv.classList.remove(type);
            }, 5000);
        }
        
        // Adiciona elementos de erro dinamicamente
        document.querySelectorAll('.form-group').forEach(group => {
            if (!group.querySelector('.error-message')) {
                const errorElement = document.createElement('small');
                errorElement.className = 'error-message';
                group.appendChild(errorElement);
            }
        });

        // Configura o botão do Mercado Pago
        const mpButton = document.querySelector('[name="MP-payButton"]');
        if (mpButton) {
            mpButton.addEventListener('click', async function(e) {
                e.preventDefault();
            
                if (!validateNome() || !validateEmail()) {
                    showFeedback('Por favor, preencha nome e e-mail corretamente.', 'error');
                    return;
                }

                try {
                    // Armazena os dados temporariamente
                    // No main.js, atualize a validação do tipo de pet
                if (!petTypeRadio) {
                    showFeedback('Por favor, selecione o tipo do seu pet.', 'error');
                    return;
                }

                // Converter para o formato que o backend espera
                const petTypeMap = {
                    'cao': 'caes',
                    'gato': 'gatos'
                };

                const leadData = {
                    nome: nomeInput.value.trim(),
                    email: emailInput.value.trim(),
                    telefone: telefoneInput ? telefoneInput.value.replace(/\D/g, '') : '',
                    petType: petTypeMap[petTypeRadio.value] || petTypeRadio.value
                };

                    // Mostra feedback de carregamento
                    showFeedback('Processando sua assinatura...', 'info');
                    
                    // Envia para o backend
                    const response = await fetch('/create-subscription', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(leadData)
                    });

                    // Verificação completa da resposta
                    if (!response) {
                        throw new Error('Sem resposta do servidor');
                    }

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(errorText || 'Erro no servidor');
                    }

                    const data = await response.json();
                    
                    if (!data.payment_url && !data.sandbox_init_point && !data.init_point) {
                        throw new Error('URL de pagamento não recebida');
                    }

                    // Redireciona para o checkout do Mercado Pago
                    const paymentUrl = data.payment_url || 
                                      (process.env.NODE_ENV === 'production' ? data.init_point : data.sandbox_init_point);
                    
                    window.location.href = paymentUrl;
                    
                } catch (error) {
                    console.error('Erro no processo de assinatura:', error);
                    showFeedback(
                        error.message.includes('Failed to fetch') 
                            ? 'Erro de conexão com o servidor' 
                            : error.message,
                        'error'
                    );
                }
            });
        }
    }

    // ========== FAQ ACCORDION ==========
    const faqItems = document.querySelectorAll('.faq__item');
    
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq__question');
            const answer = item.querySelector('.faq__answer');
        
            if (question && answer) {
                question.setAttribute('role', 'button');
                question.setAttribute('tabindex', '0');
        
                const toggleFAQ = () => {
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                            const otherAnswer = otherItem.querySelector('.faq__answer');
                            if (otherAnswer) otherAnswer.style.maxHeight = '0';
                        }
                    });
        
                    const isActive = item.classList.toggle('active');
        
                    if (isActive) {
                        answer.style.maxHeight = answer.scrollHeight + 'px';
                        answer.setAttribute('aria-hidden', 'false');
                    } else {
                        answer.style.maxHeight = '0';
                        answer.setAttribute('aria-hidden', 'true');
                    }
        
                    const icon = question.querySelector('i');
                    if (icon) {
                        icon.style.transform = isActive ? 'rotate(180deg)' : 'rotate(0)';
                    }
                };
        
                const handleFAQInteraction = (e) => {
                    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
                    if (e.type === 'keydown') e.preventDefault();
                    toggleFAQ();
                };
        
                question.addEventListener('click', handleFAQInteraction);
                question.addEventListener('keydown', handleFAQInteraction);
            }
        });
    }

    // ========== SCROLL SUAVE ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Melhoria de acessibilidade: foco no elemento alvo
                setTimeout(() => {
                    targetElement.setAttribute('tabindex', '-1');
                    targetElement.focus();
                }, 1000);
            }
        });
    });
});