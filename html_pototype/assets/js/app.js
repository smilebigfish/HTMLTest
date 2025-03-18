// 主應用程式 JavaScript

// 暗色模式切換
function toggleDarkMode() {
    document.body.classList.toggle('dark');
    
    // 儲存用戶偏好
    const isDarkMode = document.body.classList.contains('dark');
    localStorage.setItem('darkMode', isDarkMode);
}

// 初始化暗色模式
function initDarkMode() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedDarkMode = localStorage.getItem('darkMode');
    
    if (storedDarkMode === 'true' || (storedDarkMode === null && prefersDark)) {
        document.body.classList.add('dark');
    }
}

// 頁面載入動畫
function handleFrameLoading() {
    const frame = document.getElementById('content-frame');
    if (frame) {
        frame.classList.add('loading');
        
        frame.onload = function() {
            frame.classList.remove('loading');
        };
    }
}

// 導航處理
function setupNavigation() {
    document.addEventListener('click', function(e) {
        const navLink = e.target.closest('[data-nav-link]');
        if (navLink) {
            e.preventDefault();
            const target = navLink.getAttribute('data-target');
            navigateTo(target);
            
            // 更新活動導航項目
            document.querySelectorAll('[data-nav-link]').forEach(link => {
                link.classList.remove('active');
            });
            navLink.classList.add('active');
        }
    });
}

// 響應式設計處理
function handleResponsiveDesign() {
    const isMobile = window.innerWidth < 768;
    const desktopElements = document.querySelectorAll('.desktop-only');
    const mobileElements = document.querySelectorAll('.mobile-only');
    
    desktopElements.forEach(el => {
        el.style.display = isMobile ? 'none' : '';
    });
    
    mobileElements.forEach(el => {
        el.style.display = isMobile ? '' : 'none';
    });
}

// 初始化應用程式
function initApp() {
    initDarkMode();
    setupNavigation();
    handleFrameLoading();
    handleResponsiveDesign();
    
    // 監聽視窗大小變化
    window.addEventListener('resize', handleResponsiveDesign);
}

// 當DOM載入完成後執行初始化
document.addEventListener('DOMContentLoaded', initApp);

// 設計工具相關功能
const designTools = {
    // 更改顏色
    changeColor: function(elementId, color) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.backgroundColor = color;
        }
    },
    
    // 更改材質
    changeMaterial: function(elementId, materialUrl) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.backgroundImage = `url(${materialUrl})`;
        }
    },
    
    // 移動物件
    moveObject: function(elementId, x, y) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.transform = `translate(${x}px, ${y}px)`;
        }
    }
};

// 專案管理功能
const projectManager = {
    // 儲存專案
    saveProject: function(projectData) {
        const projects = JSON.parse(localStorage.getItem('designProjects') || '[]');
        projects.push(projectData);
        localStorage.setItem('designProjects', JSON.stringify(projects));
    },
    
    // 載入專案
    loadProject: function(projectId) {
        const projects = JSON.parse(localStorage.getItem('designProjects') || '[]');
        return projects.find(p => p.id === projectId);
    },
    
    // 取得所有專案
    getAllProjects: function() {
        return JSON.parse(localStorage.getItem('designProjects') || '[]');
    }
}; 