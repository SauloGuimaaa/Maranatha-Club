/**
 * Maranatha PetVIP - Main JavaScript
 * Controle de formulários e interações da landing page
 */

document.addEventListener('DOMContentLoaded', function() {
    // ========== CONTROLE DO FORMULÁRIO ==========
    const petvipForm = document.getElementById('petvipForm');
    
    if (petvipForm) {
        // Elementos do formulário
        const nomeInput = document.getElementById('nome');
        const emailInput = document.getElementById('email');
        const telefoneInput = document.getElementById('telefone');
        const submitBtn = petvipForm.querySelector('.form-submit-btn');
        const feedbackDiv = document.createElement('div');
        const loadingDiv = document.createElement('div');
        
        // Configura elementos dinâmicos
        feedbackDiv.className = 'form-feedback';
        petvipForm.appendChild(feedbackDiv);
        
        loadingDiv.className = 'form-loading';
        loadingDiv.innerHTML = `
            <div class="spinner"></div>
            <p>Enviando seus dados...</p>
        `;
        petvipForm.appendChild(loadingDiv);
        
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
        }
        
        // Validação em tempo real
        nomeInput.addEventListener('blur', validateNome);
        emailInput.addEventListener('blur', validateEmail);
        
        // Envio do formulário
        petvipForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validação final antes de enviar
            const isNomeValid = validateNome();
            const isEmailValid = validateEmail();
            
            if (isNomeValid && isEmailValid) {
                try {
                    // Mostra loading
                    loadingDiv.classList.add('active');
                    submitBtn.disabled = true;
                    
                    // Simulação de envio (substituir por fetch/axios na implementação real)
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    // Feedback de sucesso
                    showFeedback(`Obrigado, ${nomeInput.value}! Seu interesse no plano PETVIP foi registrado. Em breve nossa equipe entrará em contato.`, 'success');
                    
                    // Limpar formulário
                    petvipForm.reset();
                    
                    // Scroll para feedback (melhoria UX)
                    feedbackDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                } catch (error) {
                    showFeedback('Ocorreu um erro ao enviar seus dados. Por favor, tente novamente mais tarde.', 'error');
                    console.error('Erro no formulário:', error);
                } finally {
                    loadingDiv.classList.remove('active');
                    submitBtn.disabled = false;
                }
            } else {
                showFeedback('Por favor, preencha todos os campos obrigatórios corretamente.', 'error');
            }
        });
        
        // Funções de validação
        function validateNome() {
            const nomeGroup = nomeInput.closest('.form-group');
            if (nomeInput.value.trim().length < 3) {
                nomeGroup.classList.add('error');
                nomeGroup.querySelector('.error-message').textContent = 'Por favor, insira seu nome completo';
                return false;
            } else {
                nomeGroup.classList.remove('error');
                return true;
            }
        }
        
        function validateEmail() {
            const emailGroup = emailInput.closest('.form-group');
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (!re.test(emailInput.value.trim())) {
                emailGroup.classList.add('error');
                emailGroup.querySelector('.error-message').textContent = 'Por favor, insira um e-mail válido';
                return false;
            } else {
                emailGroup.classList.remove('error');
                return true;
            }
        }
        
        function showFeedback(message, type) {
            feedbackDiv.textContent = message;
            feedbackDiv.className = 'form-feedback';
            feedbackDiv.classList.add(type);
            
            // Remove feedback após 5 segundos
            setTimeout(() => {
                feedbackDiv.classList.remove(type);
            }, 5000);
        }
        
        // Adiciona elementos de erro dinamicamente
        document.querySelectorAll('.form-group').forEach(group => {
            const errorElement = document.createElement('small');
            errorElement.className = 'error-message';
            group.appendChild(errorElement);
        });
    }
    
    // ========== OUTRAS INTERAÇÕES DA PÁGINA ==========
    // ========== FAQ ACCORDION ==========
    const faqItems = document.querySelectorAll('.faq__item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq__question');
        const answer = item.querySelector('.faq__answer');
        
        question.addEventListener('click', () => {
            // Fecha todos os outros itens
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq__answer').style.maxHeight = '0';
                }
            });
            
            // Abre/fecha o item clicado
            const isActive = item.classList.toggle('active');
            
            // Animação suave
            if (isActive) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = '0';
            }
            
            // Rotaciona o ícone
            const icon = question.querySelector('i');
            icon.style.transform = isActive ? 'rotate(180deg)' : 'rotate(0)';
        });
    });
    
        // ========== SCROLL SUAVE ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});