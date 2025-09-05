/**
 * GitHub Pages용 스마트 To-Do List 애플리케이션
 * 로컬 스토리지를 사용한 완전 정적 버전
 */

class GitHubPagesTodoApp {
    constructor() {
        this.todosList = [];
        this.activeFilter = 'all';
        this.storageKey = 'mcp-smart-todos';
        this.initializeApplication();
    }

    initializeApplication() {
        this.loadTodosFromStorage();
        this.setupEventListeners();
        this.renderTodoList();
        this.updateStatistics();
        this.generateRecommendations();
        this.renderProductivityMetrics();
    }

    setupEventListeners() {
        // 할일 생성 폼 이벤트
        document.getElementById('todoCreationForm').addEventListener('submit', (event) => {
            event.preventDefault();
            this.createNewTodo();
        });

        // 필터 버튼 이벤트
        document.querySelectorAll('.filter-button').forEach(button => {
            button.addEventListener('click', (event) => {
                this.applyFilter(event.target.dataset.filter);
            });
        });
    }

    // 로컬 스토리지에서 할일 목록 로드
    loadTodosFromStorage() {
        try {
            const storedTodos = localStorage.getItem(this.storageKey);
            if (storedTodos) {
                this.todosList = JSON.parse(storedTodos);
            } else {
                // 초기 샘플 데이터
                this.todosList = [
                    {
                        todo_id: 'sample-1',
                        todo_title: 'MCP 시스템 상세 문서화 작업',
                        todo_description: 'Sequential Thinking과 MCP 연결에 대한 기술 문서 작성 및 사용자 가이드 제작',
                        priority_level: 'high',
                        current_status: 'pending',
                        category_name: '업무',
                        created_timestamp: new Date().toISOString(),
                        updated_timestamp: new Date().toISOString(),
                        estimated_duration_minutes: 120,
                        tag_list: ['문서작성', 'MCP', '기술문서']
                    },
                    {
                        todo_id: 'sample-2',
                        todo_title: 'GitHub Pages 배포 테스트',
                        todo_description: '정적 웹사이트로 변환된 To-Do 앱의 GitHub Pages 배포 확인',
                        priority_level: 'medium',
                        current_status: 'completed',
                        category_name: '프로젝트',
                        created_timestamp: new Date().toISOString(),
                        updated_timestamp: new Date().toISOString(),
                        estimated_duration_minutes: 30,
                        tag_list: ['배포', 'GitHub', '테스트']
                    }
                ];
                this.saveTodosToStorage();
            }
        } catch (error) {
            console.error('할일 목록 로드 실패:', error);
            this.todosList = [];
        }
    }

    // 로컬 스토리지에 할일 목록 저장
    saveTodosToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.todosList));
        } catch (error) {
            console.error('할일 목록 저장 실패:', error);
            this.showNotification('데이터 저장에 실패했습니다.', 'error');
        }
    }

    createNewTodo() {
        const newTodoData = {
            todo_id: 'todo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            todo_title: document.getElementById('todoTitleInput').value,
            todo_description: document.getElementById('todoDescriptionInput').value,
            priority_level: document.getElementById('todoPrioritySelect').value,
            current_status: 'pending',
            category_name: document.getElementById('todoCategorySelect').value,
            estimated_duration_minutes: parseInt(document.getElementById('todoEstimatedTimeInput').value) || null,
            due_date_time: document.getElementById('todoDueDateInput').value || null,
            created_timestamp: new Date().toISOString(),
            updated_timestamp: new Date().toISOString(),
            tag_list: []
        };

        // 복잡도 분석 (간소화된 버전)
        const complexity = this.analyzeComplexity(newTodoData);
        
        this.todosList.unshift(newTodoData);
        this.saveTodosToStorage();
        
        this.showNotification(`새로운 할일이 추가되었습니다! (복잡도: ${complexity})`, 'success');
        
        // 폼 초기화
        document.getElementById('todoCreationForm').reset();
        
        // 화면 업데이트
        this.renderTodoList();
        this.updateStatistics();
        this.generateRecommendations();
        this.renderProductivityMetrics();
    }

    // 간소화된 복잡도 분석
    analyzeComplexity(todo) {
        let score = 0;
        
        // 우선순위 점수
        const priorityScore = {high: 3, medium: 2, low: 1};
        score += priorityScore[todo.priority_level] || 2;
        
        // 예상 시간 점수
        if (todo.estimated_duration_minutes) {
            if (todo.estimated_duration_minutes > 120) score += 2;
            else if (todo.estimated_duration_minutes > 60) score += 1;
        }
        
        // 설명 길이 점수
        if (todo.todo_description && todo.todo_description.length > 50) score += 1;
        
        return score > 4 ? '높음' : score > 2 ? '보통' : '낮음';
    }

    updateTodoStatus(todoId, newStatus) {
        const todoIndex = this.todosList.findIndex(todo => todo.todo_id === todoId);
        if (todoIndex !== -1) {
            this.todosList[todoIndex].current_status = newStatus;
            this.todosList[todoIndex].updated_timestamp = new Date().toISOString();
            this.saveTodosToStorage();
            
            this.showNotification('할일 상태가 업데이트되었습니다!', 'success');
            this.renderTodoList();
            this.updateStatistics();
            this.renderProductivityMetrics();
        }
    }

    deleteTodo(todoId) {
        if (!confirm('정말로 이 할일을 삭제하시겠습니까?')) {
            return;
        }

        this.todosList = this.todosList.filter(todo => todo.todo_id !== todoId);
        this.saveTodosToStorage();
        
        this.showNotification('할일이 삭제되었습니다!', 'success');
        this.renderTodoList();
        this.updateStatistics();
        this.renderProductivityMetrics();
    }

    renderTodoList() {
        const todoContainer = document.getElementById('todoListContainer');
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            todoContainer.innerHTML = `
                <div style="text-align: center; padding: 60px; color: #666;">
                    <i class="fas fa-inbox" style="font-size: 4rem; margin-bottom: 25px; opacity: 0.5;"></i>
                    <p style="font-size: 1.2rem;">표시할 할일이 없습니다.</p>
                </div>
            `;
            return;
        }

        todoContainer.innerHTML = filteredTodos.map(todo => this.renderTodoItem(todo)).join('');
    }

    renderTodoItem(todo) {
        const dueDateTime = todo.due_date_time ? new Date(todo.due_date_time).toLocaleString('ko-KR') : null;
        const isOverdue = dueDateTime && new Date(todo.due_date_time) < new Date() && todo.current_status !== 'completed';
        
        return `
            <div class="todo-item ${todo.current_status}" ${isOverdue ? 'style="border-color: #f44336;"' : ''}>
                <div class="todo-item-header">
                    <div>
                        <div class="todo-title">${todo.todo_title}</div>
                        ${todo.todo_description ? `<div class="todo-description">${todo.todo_description}</div>` : ''}
                    </div>
                    <div class="complexity-indicator complexity-${this.determineComplexityLevel(todo)}"></div>
                </div>
                
                <div class="todo-metadata">
                    <div class="metadata-item">
                        <i class="fas fa-flag"></i>
                        <span class="priority-indicator priority-${todo.priority_level}">${this.getPriorityText(todo.priority_level)}</span>
                    </div>
                    <div class="metadata-item">
                        <i class="fas fa-tag"></i>
                        <span class="status-indicator status-${todo.current_status}">${this.getStatusText(todo.current_status)}</span>
                    </div>
                    <div class="metadata-item">
                        <i class="fas fa-folder"></i>
                        <span>${todo.category_name}</span>
                    </div>
                    ${todo.estimated_duration_minutes ? `
                        <div class="metadata-item">
                            <i class="fas fa-clock"></i>
                            <span>${todo.estimated_duration_minutes}분</span>
                        </div>
                    ` : ''}
                    ${dueDateTime ? `
                        <div class="metadata-item ${isOverdue ? 'style="color: #f44336; font-weight: bold;"' : ''}">
                            <i class="fas fa-calendar"></i>
                            <span>${dueDateTime}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="todo-actions">
                    ${todo.current_status === 'pending' ? `
                        <button class="action-button action-start" onclick="todoApp.updateTodoStatus('${todo.todo_id}', 'in_progress')">
                            <i class="fas fa-play"></i> 시작하기
                        </button>
                    ` : ''}
                    ${todo.current_status === 'in_progress' ? `
                        <button class="action-button action-complete" onclick="todoApp.updateTodoStatus('${todo.todo_id}', 'completed')">
                            <i class="fas fa-check"></i> 완료하기
                        </button>
                    ` : ''}
                    ${todo.current_status !== 'completed' ? `
                        <button class="action-button action-pause" onclick="todoApp.updateTodoStatus('${todo.todo_id}', 'pending')">
                            <i class="fas fa-pause"></i> 대기로 변경
                        </button>
                    ` : ''}
                    <button class="action-button action-delete" onclick="todoApp.deleteTodo('${todo.todo_id}')">
                        <i class="fas fa-trash"></i> 삭제하기
                    </button>
                </div>
            </div>
        `;
    }

    getFilteredTodos() {
        if (this.activeFilter === 'all') {
            return this.todosList;
        } else if (this.activeFilter === 'high') {
            return this.todosList.filter(todo => todo.priority_level === 'high');
        } else {
            return this.todosList.filter(todo => todo.current_status === this.activeFilter);
        }
    }

    applyFilter(filterType) {
        this.activeFilter = filterType;
        
        // 필터 버튼 활성화 상태 변경
        document.querySelectorAll('.filter-button').forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filterType}"]`).classList.add('active');
        
        this.renderTodoList();
    }

    determineComplexityLevel(todo) {
        let complexityScore = 0;
        
        if (todo.priority_level === 'high') complexityScore += 2;
        else if (todo.priority_level === 'medium') complexityScore += 1;
        
        if (todo.estimated_duration_minutes > 120) complexityScore += 2;
        else if (todo.estimated_duration_minutes > 60) complexityScore += 1;
        
        if (todo.todo_description && todo.todo_description.length > 100) complexityScore += 1;
        
        return complexityScore > 3 ? 'high' : complexityScore > 1 ? 'medium' : 'low';
    }

    getPriorityText(priority) {
        const priorityTexts = { high: '높음', medium: '보통', low: '낮음' };
        return priorityTexts[priority] || priority;
    }

    getStatusText(status) {
        const statusTexts = {
            pending: '대기 중',
            in_progress: '진행 중', 
            completed: '완료됨',
            cancelled: '취소됨'
        };
        return statusTexts[status] || status;
    }

    updateStatistics() {
        const totalCount = this.todosList.length;
        const completedCount = this.todosList.filter(t => t.current_status === 'completed').length;
        const pendingCount = this.todosList.filter(t => t.current_status === 'pending').length;
        const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        document.getElementById('totalTasksCount').textContent = totalCount;
        document.getElementById('completedTasksCount').textContent = completedCount;
        document.getElementById('pendingTasksCount').textContent = pendingCount;
        document.getElementById('completionRatePercent').textContent = completionRate + '%';
    }

    generateRecommendations() {
        const recommendations = [];
        const totalCount = this.todosList.length;
        const completedCount = this.todosList.filter(t => t.current_status === 'completed').length;
        const highPriorityCount = this.todosList.filter(t => t.priority_level === 'high' && t.current_status !== 'completed').length;
        
        // 간단한 추천 로직
        if (completedCount === 0 && totalCount > 0) {
            recommendations.push('첫 번째 할일을 완료해보세요! 작은 성취감이 동기부여가 됩니다.');
        }
        
        if (totalCount > 0 && (completedCount / totalCount) < 0.3) {
            recommendations.push('완료율이 낮습니다. 더 작은 할일로 나누어 관리해보세요.');
        }
        
        if (highPriorityCount > 3) {
            recommendations.push('높은 우선순위 할일이 많습니다. 우선순위를 재조정해보세요.');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('잘 관리하고 계십니다! 꾸준히 진행하세요.');
        }

        this.renderRecommendations(recommendations);
    }

    renderRecommendations(recommendations) {
        const recommendationsContainer = document.getElementById('recommendationsContainer');
        
        recommendationsContainer.innerHTML = `
            <h4 style="margin-bottom: 20px; color: #333; font-size: 1.2rem;">
                <i class="fas fa-lightbulb"></i> 스마트 추천 사항
            </h4>
            ${recommendations.map(recommendation => `
                <div class="recommendation-item">
                    <i class="fas fa-check-circle" style="color: #4CAF50; margin-right: 10px;"></i>
                    ${recommendation}
                </div>
            `).join('')}
        `;
    }

    renderProductivityMetrics() {
        const totalCount = this.todosList.length;
        const completedCount = this.todosList.filter(t => t.current_status === 'completed').length;
        const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        const pendingCount = this.todosList.filter(t => t.current_status === 'pending').length;
        const inProgressCount = this.todosList.filter(t => t.current_status === 'in_progress').length;
        
        const productivityContainer = document.getElementById('productivityContainer');
        
        productivityContainer.innerHTML = `
            <div class="productivity-chart">
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                    <span style="font-weight: 600;">완료율</span>
                    <span style="font-weight: bold; color: #4CAF50;">${completionRate}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${completionRate}%;"></div>
                </div>
            </div>
            
            <div class="analytics-grid">
                <div class="analytics-card">
                    <div class="analytics-number">${pendingCount}</div>
                    <div class="analytics-label">대기 중인 할일</div>
                </div>
                <div class="analytics-card">
                    <div class="analytics-number" style="color: #FF9800;">${inProgressCount}</div>
                    <div class="analytics-label">진행 중인 할일</div>
                </div>
            </div>
        `;
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification-toast ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : 'exclamation-triangle'}"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// 페이지 로드 완료 후 애플리케이션 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 애플리케이션 초기화
    window.todoApp = new GitHubPagesTodoApp();
    
    // 로딩 표시 숨기기
    setTimeout(() => {
        document.querySelectorAll('.loading-indicator').forEach(loader => {
            loader.style.display = 'none';
        });
    }, 1000);
});
