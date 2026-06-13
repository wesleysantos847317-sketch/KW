/* ============================================
   KW STUDIO - JAVASCRIPT
   Funcionalidades interativas do site
   ============================================ */

// ===== UTILIDADES DE VALIDAÇÃO =====
/* Objeto com funções de validação de dados */
const Validators = {
    /* Valida se o email tem formato correto */
    email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    
    /* Valida se o telefone tem formato correto (com ou sem máscara) */
    telefone: (telefone) => /^(\+?55\s?)?(\(?\d{2}\)?)\s?9?\d{4,5}-?\d{4}$/.test(telefone.replace(/\D/g, '')),
    
    /* Valida se o nome tem pelo menos 3 caracteres */
    nome: (nome) => nome.trim().length >= 3,
    
    /* Valida se a mensagem tem pelo menos 10 caracteres */
    mensagem: (msg) => msg.trim().length >= 10
};

// ===== UTILIDADES GERAIS DO DOM =====
/* Objeto com funções auxiliares para manipulação do DOM */
const DOMUtils = {
    /* Verifica se um elemento existe */
    hasElement: (selector) => !!document.querySelector(selector),
    
    /* Retorna uma lista de elementos */
    getAllElements: (selector) => document.querySelectorAll(selector),
    
    /* Retorna um único elemento */
    getElement: (selector) => document.querySelector(selector),
    
    /* Adiciona classe a um elemento */
    addClass: (el, className) => el?.classList.add(className),
    
    /* Remove classe de um elemento */
    removeClass: (el, className) => el?.classList.remove(className),
    
    /* Alterna classe de um elemento */
    toggleClass: (el, className) => el?.classList.toggle(className),
    
    /* Define atributo aria em um elemento */
    setAriaAttr: (el, attr, value) => el?.setAttribute(`aria-${attr}`, value)
};

// ===== MENU RESPONSIVO =====
/* Inicializa funcionalidades do menu mobile */
function initResponsiveMenu() {
    const menuToggle = DOMUtils.getElement('#menuToggle');
    const navMenu = DOMUtils.getElement('#navMenu');
    const navLinks = DOMUtils.getAllElements('.nav-link');

    if (!menuToggle || !navMenu) return;

    /* Evento de clique no botão de menu */
    menuToggle.addEventListener('click', () => {
        const isActive = navMenu.classList.toggle('active');
        DOMUtils.toggleClass(menuToggle, 'active');
        DOMUtils.setAriaAttr(menuToggle, 'expanded', String(isActive));
        menuToggle.setAttribute('aria-label', isActive ? 'Fechar menu' : 'Abrir menu');
    });

    /* Fecha menu ao clicar em um link */
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                DOMUtils.removeClass(navMenu, 'active');
                DOMUtils.removeClass(menuToggle, 'active');
                DOMUtils.setAriaAttr(menuToggle, 'expanded', 'false');
            }
        });
    });
}

// ===== GALERIA DE UNHAS =====
/* Controlador da galeria com funcionalidades de renderização e filtro */
const GaleriaController = (() => {
    /* Filtra os itens de galeria já presentes no HTML */
    const filterGaleria = (filtro = 'todos') => {
        const galeriaItems = DOMUtils.getAllElements('#galeria-grid .galeria-item');
        galeriaItems.forEach(item => {
            const categoria = item.getAttribute('data-categoria');
            const mostrar = filtro === 'todos' || categoria === filtro;
            item.style.display = mostrar ? '' : 'none';
        });
    };

    /* Inicializa a galeria e seus filtros */
    const init = () => {
        filterGaleria();
        const filtroBtns = DOMUtils.getAllElements('.filtro-btn');
        filtroBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                /* Remove classe active de todos os botões */
                filtroBtns.forEach(b => DOMUtils.removeClass(b, 'active'));
                /* Adiciona classe active ao botão clicado */
                DOMUtils.addClass(btn, 'active');
                /* Filtra os itens existentes no HTML */
                filterGaleria(btn.getAttribute('data-filtro'));
            });
        });
    };

    /* Retorna métodos públicos */
    return { init, filterGaleria };
})();

// ===== GERENCIADOR DE NOTIFICAÇÕES =====
/* Controla exibição de notificações no site */
const NotificationManager = (() => {
    /* Exibe uma notificação */
    const show = (mensagem, tipo = 'info', duracao = 3000) => {
        const notificacao = document.createElement('div');
        notificacao.className = `notification notification-${tipo}`;
        notificacao.setAttribute('role', 'status');
        notificacao.setAttribute('aria-live', 'polite');
        notificacao.textContent = mensagem;
        document.body.appendChild(notificacao);

        /* Esconde e remove notificação após o tempo */
        setTimeout(() => {
            DOMUtils.addClass(notificacao, 'notification-hide');
            setTimeout(() => notificacao.remove(), 300);
        }, duracao);
    };

    /* Retorna métodos de conveniência */
    return { 
        show, 
        success: (msg) => show(msg, 'success'), 
        error: (msg) => show(msg, 'error'), 
        info: (msg) => show(msg, 'info') 
    };
})();

// ===== CONTROLADOR DO FORMULÁRIO =====
/* Gerencia validação e envio do formulário de contato */
const FormController = (() => {
    /* Valida dados do formulário */
    const validarFormulario = (dados) => {
        const errors = {
            nome: '',
            email: '',
            telefone: '',
            servico: '',
            mensagem: ''
        };

        if (!Validators.nome(dados.nome)) {
            errors.nome = 'Nome deve ter pelo menos 3 caracteres';
        }

        if (!Validators.email(dados.email)) {
            errors.email = 'Email inválido';
        }

        if (!Validators.telefone(dados.telefone)) {
            errors.telefone = 'Telefone inválido';
        }

        if (!dados.servico) {
            errors.servico = 'Selecione um serviço';
        }

        if (!Validators.mensagem(dados.mensagem)) {
            errors.mensagem = 'Mensagem deve ter pelo menos 10 caracteres';
        }

        const hasErrors = Object.values(errors).some(Boolean);
        return { valid: !hasErrors, errors };
    };

    /* Inicializa o formulário */
    const init = () => {
        const formContato = DOMUtils.getElement('#formContato');
        if (!formContato) return;

        /* Evento de envio do formulário */
        const submitBtn = formContato.querySelector('[data-submit-btn]');

        const setSubmitting = (isSubmitting) => {
            if (!submitBtn) return;
            submitBtn.disabled = !!isSubmitting;
            submitBtn.classList.toggle('loading', !!isSubmitting);
            formContato.classList.toggle('submitting', !!isSubmitting);
            submitBtn.setAttribute('aria-busy', !!isSubmitting);
            const buttonText = submitBtn.querySelector('.btn-text');
            if (buttonText) {
                buttonText.textContent = isSubmitting ? 'Enviando...' : 'Enviar Mensagem';
            }
        };

        formContato.addEventListener('submit', (event) => {
            event.preventDefault();
            setSubmitting(true);

            /* Limpa mensagens anteriores */
            ['nome','email','telefone','servico','mensagem'].forEach(id => {
                const el = formContato.querySelector(`#error-${id}`);
                if (el) el.textContent = '';
                const input = formContato.querySelector(`#${id}`);
                if (input) {
                    input.classList.remove('is-invalid');
                    input.classList.remove('is-valid');
                }
            });

            /* Coleta dados do formulário */
            const dados = {
                nome: formContato.querySelector('#nome')?.value.trim() || '',
                email: formContato.querySelector('#email')?.value.trim() || '',
                telefone: formContato.querySelector('#telefone')?.value.trim() || '',
                servico: formContato.querySelector('#servico')?.value || '',
                mensagem: formContato.querySelector('#mensagem')?.value.trim() || ''
            };

            /* Valida dados */
            const resultado = validarFormulario(dados);
            if (!resultado.valid) {
                /* Preenche mensagens por campo */
                Object.entries(resultado.errors).forEach(([field, msg]) => {
                    const errEl = formContato.querySelector(`#error-${field}`);
                    const inputEl = formContato.querySelector(`#${field}`);
                    if (errEl) errEl.textContent = msg;
                    if (inputEl) inputEl.classList.toggle('is-invalid', !!msg);
                    if (inputEl) inputEl.classList.toggle('is-valid', !msg && inputEl.value.trim().length > 0);
                });

                /* Mostra a primeira mensagem como toast */
                const firstMsg = Object.values(resultado.errors).find(Boolean);
                if (firstMsg) NotificationManager.error(firstMsg);
                setSubmitting(false);
                return;
            }

            /* Envia o formulário via AJAX para FormSubmit e mostra popup sem redirecionar */
            const formData = new FormData(formContato);

            fetch(formContato.action, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData,
                mode: 'cors'
            })
                .then(async (response) => {
                    const text = await response.text();
                    let body = null;

                    try {
                        body = JSON.parse(text);
                    } catch (err) {
                        body = null;
                    }

                    if (!response.ok) {
                        const message = (body && body.error)
                            ? body.error
                            : 'Erro ao enviar o formulário. Tente novamente.';
                        throw new Error(message);
                    }

                    return body || text;
                })
                .then(() => {
                    NotificationManager.success('Obrigado, seu formulário foi enviado');
                    formContato.reset();
                })
                .catch((error) => {
                    NotificationManager.error(error.message || 'Erro ao enviar o formulário. Verifique sua conexão.');
                })
                .finally(() => {
                    setSubmitting(false);
                });
        });
    };

    /* Retorna métodos públicos */
    return { init, validarFormulario };
})();

// ===== VALIDAÇÃO VISUAL DO FORMULÁRIO =====
/* Adiciona classes de validação visual enquanto o usuário digita */
function initFormVisualValidation() {
    const inputs = DOMUtils.getAllElements('.formulario-contato input, .formulario-contato textarea, .formulario-contato select');
    
    inputs.forEach(input => {
        /* Ao sair do campo (blur), valida e marca */
        input.addEventListener('blur', () => {
            const isValid = input.value.trim().length > 0;
            DOMUtils.toggleClass(input, 'is-invalid', !isValid);
            DOMUtils.toggleClass(input, 'is-valid', isValid);
        });

        /* Ao focar no campo, remove marcações */
        input.addEventListener('focus', () => {
            DOMUtils.removeClass(input, 'is-invalid');
            DOMUtils.removeClass(input, 'is-valid');
        });
    });
}

// ===== ANIMAÇÕES AO SCROLL =====
/* Anima elementos quando entram na viewport */
function initScrollAnimations() {
    /* Verifica se o navegador suporta IntersectionObserver */
    if (!('IntersectionObserver' in window)) return;

    /* Observer para detectar elementos visíveis */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            /* Quando elemento entra na viewport */
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    /* Observa cards de serviço e depoimentos */
    DOMUtils.getAllElements('.servico-card, .depoimento-card').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

// ===== SCROLL SPY - DESTACA LINK DO MENU ATIVO =====
/* Destaca o link de navegação correspondente à seção visível */
function initScrollSpy() {
    const navLinks = DOMUtils.getAllElements('.nav-link');
    
    window.addEventListener('scroll', () => {
        let current = '';

        /* Encontra qual seção está visível */
        DOMUtils.getAllElements('section[id]').forEach(section => {
            if (window.scrollY >= section.offsetTop - 200) {
                current = section.getAttribute('id');
            }
        });

        /* Ativa o link correspondente */
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${current}`);
        });
    });
}

// ===== ATUALIZAR ANO NO FOOTER =====
/* Atualiza o ano atual no rodapé automaticamente */
function updateYearInFooter() {
    const currentYear = DOMUtils.getElement('#currentYear');
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }
}

// ===== RASTREAMENTO DE EVENTOS =====
/* Rastreia cliques e interações para análise */
const EventTracker = (() => {
    /* Registra um evento */
    const track = (categoria, acao, label = '') => {
        console.log(`[Event] ${categoria} - ${acao}${label ? ` - ${label}` : ''}`);
        /* Integração com Google Analytics pode ser feita aqui */
        // gtag('event', acao, { event_category: categoria, event_label: label });
    };

    /* Inicializa rastreamento de cliques */
    const init = () => {
        DOMUtils.getAllElements('.btn-primary, .btn-servico, .filtro-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                track('Botão', 'Clicado', btn.textContent.trim());
            });
        });
    };

    /* Retorna métodos públicos */
    return { track, init };
})();

// ===== INICIALIZAÇÃO GERAL DA APLICAÇÃO =====
/* Função principal que inicializa todas as funcionalidades */
function initApp() {
    console.log('[App] Inicializando KW Studio...');
    
    try {
        /* Inicializa cada módulo */
        initResponsiveMenu();
        GaleriaController.init();
        FormController.init();
        initFormVisualValidation();
        initScrollAnimations();
        initScrollSpy();
        EventTracker.init();
        updateYearInFooter();
        
        console.log('[App] KW Studio carregado com sucesso!');
    } catch (error) {
        console.error('[App] Erro ao inicializar:', error);
        NotificationManager.error('Erro ao carregar a página. Tente atualizar.');
    }
}

// ===== AGUARDA CARREGAMENTO DO DOM =====
/* Garante que o DOM está totalmente carregado antes de executar */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    /* Se o DOM já foi carregado, executa imediatamente */
    initApp();
}

