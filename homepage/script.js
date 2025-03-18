// 等待 DOM 完全加載
document.addEventListener('DOMContentLoaded', function() {
    // 添加滾動動畫
    addScrollAnimations();
    
    // 添加分類項目的懸停效果
    addCategoryHoverEffects();
    
    // 添加產品卡片的懸停效果
    addProductCardEffects();
    
    // 添加表單驗證
    setupFormValidation();
});

/**
 * 添加滾動時的動畫效果
 */
function addScrollAnimations() {
    // 獲取所有需要添加動畫的元素
    const fadeElements = document.querySelectorAll('.categories, .brand-intro, .best-selling, .testimonials, .auth-section');
    const valueItems = document.querySelectorAll('.value-item');
    const productCards = document.querySelectorAll('.product-card');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    
    // 為主要區塊添加淡入動畫類
    fadeElements.forEach(element => {
        element.classList.add('fade-in');
    });
    
    // 為品牌價值項目添加從左滑入動畫
    valueItems.forEach((item, index) => {
        if (index % 2 === 0) {
            item.classList.add('slide-in-left');
        } else {
            item.classList.add('slide-in-right');
        }
    });
    
    // 為產品卡片添加淡入動畫
    productCards.forEach(card => {
        card.classList.add('fade-in');
    });
    
    // 為評價卡片添加從右滑入動畫
    testimonialCards.forEach(card => {
        card.classList.add('slide-in-right');
    });
    
    // 檢查元素是否在視窗中，如果是則添加 active 類
    function checkScroll() {
        const triggerBottom = window.innerHeight * 0.8;
        
        document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < triggerBottom) {
                element.classList.add('active');
            }
        });
    }
    
    // 初始檢查
    checkScroll();
    
    // 滾動時檢查
    window.addEventListener('scroll', checkScroll);
}

/**
 * 為分類項目添加懸停效果
 */
function addCategoryHoverEffects() {
    const categoryItems = document.querySelectorAll('.category-item');
    
    categoryItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.category-icon');
            icon.style.transform = 'scale(1.1)';
            icon.style.transition = 'transform 0.3s ease';
        });
        
        item.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.category-icon');
            icon.style.transform = 'scale(1)';
        });
    });
}

/**
 * 為產品卡片添加效果
 */
function addProductCardEffects() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        // 添加點擊效果
        card.addEventListener('click', function() {
            // 模擬點擊產品後的效果
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'translateY(-5px)';
            }, 200);
            
            // 這裡可以添加導航到產品詳情頁的代碼
            // window.location.href = 'product-detail.html?id=' + productId;
        });
        
        // 添加圖片懸停效果
        const imgContainer = card.querySelector('.product-img-container');
        const img = card.querySelector('.product-img');
        
        if (imgContainer && img) {
            imgContainer.addEventListener('mouseenter', function() {
                img.style.transform = 'scale(1.05)';
                img.style.transition = 'transform 0.5s ease';
            });
            
            imgContainer.addEventListener('mouseleave', function() {
                img.style.transform = 'scale(1)';
            });
        }
    });
}

/**
 * 設置表單驗證
 */
function setupFormValidation() {
    const form = document.querySelector('.auth-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const registerBtn = document.querySelector('.register-btn');
    const googleBtn = document.querySelector('.google-btn');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            
            // 簡單的電子郵件驗證
            if (!emailInput.value || !emailInput.value.includes('@')) {
                showError(emailInput, '請輸入有效的電子郵件地址');
                isValid = false;
            } else {
                removeError(emailInput);
            }
            
            // 密碼驗證
            if (!passwordInput.value || passwordInput.value.length < 6) {
                showError(passwordInput, '密碼必須至少包含 6 個字符');
                isValid = false;
            } else {
                removeError(passwordInput);
            }
            
            // 確認密碼驗證
            if (passwordInput.value !== confirmPasswordInput.value) {
                showError(confirmPasswordInput, '密碼不匹配');
                isValid = false;
            } else {
                removeError(confirmPasswordInput);
            }
            
            // 如果表單有效，則顯示成功消息
            if (isValid) {
                showSuccessMessage();
            }
        });
        
        // Google 登入按鈕點擊效果
        if (googleBtn) {
            googleBtn.addEventListener('click', function() {
                this.innerHTML = '<span style="opacity: 0.7;">處理中...</span>';
                setTimeout(() => {
                    this.innerHTML = 'Login with Google';
                    alert('Google 登入功能尚未實現');
                }, 1500);
            });
        }
    }
    
    // 顯示錯誤消息
    function showError(input, message) {
        const formGroup = input.parentElement;
        let errorElement = formGroup.querySelector('.error-message');
        
        if (!errorElement) {
            errorElement = document.createElement('p');
            errorElement.className = 'error-message';
            errorElement.style.color = '#e63946';
            errorElement.style.fontSize = '12px';
            errorElement.style.marginTop = '5px';
            formGroup.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        input.style.borderColor = '#e63946';
    }
    
    // 移除錯誤消息
    function removeError(input) {
        const formGroup = input.parentElement;
        const errorElement = formGroup.querySelector('.error-message');
        
        if (errorElement) {
            formGroup.removeChild(errorElement);
        }
        
        input.style.borderColor = '#ddd';
    }
    
    // 顯示成功消息
    function showSuccessMessage() {
        // 清除表單
        form.reset();
        
        // 創建成功消息元素
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.style.backgroundColor = '#4CAF50';
        successMessage.style.color = 'white';
        successMessage.style.padding = '15px';
        successMessage.style.borderRadius = '4px';
        successMessage.style.marginTop = '20px';
        successMessage.style.textAlign = 'center';
        successMessage.textContent = '註冊成功！';
        
        // 將成功消息添加到表單後面
        form.parentElement.appendChild(successMessage);
        
        // 3 秒後移除成功消息
        setTimeout(() => {
            form.parentElement.removeChild(successMessage);
        }, 3000);
    }
}

/**
 * 添加平滑滾動效果
 */
function smoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// 調用平滑滾動函數
smoothScroll(); 