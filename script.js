document.addEventListener('DOMContentLoaded', () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://arhsklad.vercel.app//api';
    
    const modal = document.getElementById('modal');
    const toolForm = document.getElementById('toolForm');
    const addToolBtn = document.getElementById('addToolBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const modalTitle = document.getElementById('modalTitle');
    
    let isEditing = false;

    // Load tools
    const loadTools = async () => {
        try {
            const response = await fetch(`${API_URL}/tools`);
            const tools = await response.json();
            displayTools(tools);
        } catch (error) {
            console.error('Error loading tools:', error);
        }
    };

    // Display tools in table
    const displayTools = (tools) => {
        const tbody = document.getElementById('toolsTableBody');
        tbody.innerHTML = '';
        
        tools.forEach(tool => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${tool.id}</td>
                <td class="px-6 py-4 whitespace-nowrap">${tool.name}</td>
                <td class="px-6 py-4 whitespace-nowrap">${tool.quantity}</td>
                <td class="px-6 py-4 whitespace-nowrap">${tool.location}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button class="edit-btn text-blue-600 hover:text-blue-900 mr-2" data-id="${tool.id}">
                        Редактировать
                    </button>
                    <button class="delete-btn text-red-600 hover:text-red-900" data-id="${tool.id}">
                        Удалить
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    // Show modal
    const showModal = (title) => {
        modalTitle.textContent = title;
        modal.classList.add('show');
    };

    // Hide modal
    const hideModal = () => {
        modal.classList.remove('show');
        toolForm.reset();
        isEditing = false;
    };

    // Add tool button click
    addToolBtn.addEventListener('click', () => {
        showModal('Добавить инструмент');
    });

    // Cancel button click
    cancelBtn.addEventListener('click', hideModal);

    // Click outside modal to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });

    // Form submit
    toolForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const toolData = {
            name: document.getElementById('name').value,
            quantity: parseInt(document.getElementById('quantity').value),
            location: document.getElementById('location').value
        };

        try {
            if (isEditing) {
                const toolId = document.getElementById('toolId').value;
                await fetch(`${API_URL}/tools/${toolId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(toolData)
                });
            } else {
                await fetch(`${API_URL}/tools`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(toolData)
                });
            }
            
            hideModal();
            loadTools();
        } catch (error) {
            console.error('Error saving tool:', error);
        }
    });

    // Edit and Delete buttons
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const toolId = e.target.dataset.id;
            try {
                const response = await fetch(`${API_URL}/tools/${toolId}`);
                const tool = await response.json();
                
                document.getElementById('toolId').value = tool.id;
                document.getElementById('name').value = tool.name;
                document.getElementById('quantity').value = tool.quantity;
                document.getElementById('location').value = tool.location;
                
                isEditing = true;
                showModal('Редактировать инструмент');
            } catch (error) {
                console.error('Error loading tool:', error);
            }
        }
        
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Вы уверены, что хотите удалить этот инструмент?')) {
                const toolId = e.target.dataset.id;
                try {
                    await fetch(`${API_URL}/tools/${toolId}`, {
                        method: 'DELETE'
                    });
                    loadTools();
                } catch (error) {
                    console.error('Error deleting tool:', error);
                }
            }
        }
    });

    // Initial load
    loadTools();
});
