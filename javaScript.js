const productForm = document.getElementById('productForm');
const productTable = document.querySelector('#productTable tbody');
const totalGainElement = document.querySelector('.total-gain');
const searchInput = document.getElementById('searchInput');
const exportDataButton = document.getElementById('exportDataButton');
const clearAllButton = document.getElementById('clearAllButton'); // Botón "Eliminar todo"
let products = JSON.parse(localStorage.getItem('products')) || [];
let totalGain = 0;

// Formatear como moneda
function formatCurrency(value) {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
}

// Guardar productos en localStorage
function saveProductsToLocalStorage() {
    localStorage.setItem('products', JSON.stringify(products));
}

// Actualizar la ganancia total
function updateTotalGain() {
    totalGain = products.reduce((sum, product) => sum + product.profit, 0);
    totalGainElement.textContent = `Ganancia total: ${formatCurrency(totalGain)}`;
}

// Filtrar productos
function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const rows = productTable.querySelectorAll('tr');
    rows.forEach(row => {
        const productName = row.cells[0]?.textContent.toLowerCase();
        if (productName) {
            row.style.display = productName.includes(searchTerm) ? '' : 'none';
        }
    });
}

// Agregar producto
function addProduct(event) {
    event.preventDefault();

    const productName = document.getElementById('productName').value.trim();
    const purchasePrice = parseFloat(document.getElementById('purchasePrice').value);
    const salePrice = parseFloat(document.getElementById('salePrice').value);
    const shippingCost = parseFloat(document.getElementById('shippingCost').value);

    if (!productName || isNaN(purchasePrice) || isNaN(salePrice) || isNaN(shippingCost)) {
        alert('Por favor, complete todos los campos correctamente.');
        return;
    }

    const profit = salePrice - purchasePrice - shippingCost;
    const product = { name: productName, purchasePrice, salePrice, shippingCost, profit };

    products.push(product);
    saveProductsToLocalStorage();
    addProductToTable(product, products.length - 1);
    updateTotalGain();

    productForm.reset();
    filterProducts(); // Asegurar que el nuevo producto respete el filtro actual
}

// Eliminar producto
function deleteProduct(index) {
    products.splice(index, 1);
    saveProductsToLocalStorage();
    loadProducts();
    filterProducts(); // Actualizar la tabla filtrada
}

// Editar producto
function editProduct(index, product) {
    document.getElementById('productName').value = product.name;
    document.getElementById('purchasePrice').value = product.purchasePrice;
    document.getElementById('salePrice').value = product.salePrice;
    document.getElementById('shippingCost').value = product.shippingCost;

    deleteProduct(index);
}

// Cargar productos a la tabla
function loadProducts() {
    productTable.innerHTML = '';
    products.forEach((product, index) => addProductToTable(product, index));
    updateTotalGain();
}

// Agregar producto a la tabla
function addProductToTable(product, index) {
    const percentageProfit = ((product.profit / product.purchasePrice) * 100).toFixed(2);

    const row = document.createElement('tr');
    row.dataset.index = index;
    row.innerHTML = `
        <td>${product.name}</td>
        <td>${formatCurrency(product.purchasePrice)}</td>
        <td>${formatCurrency(product.salePrice)}</td>
        <td>${formatCurrency(product.shippingCost)}</td>
        <td>${formatCurrency(product.profit)}</td>
        <td>${percentageProfit}%</td>
        <td>
            <button class="editButton">Editar</button>
            <button class="deleteButton">Eliminar</button>
        </td>
    `;
    productTable.appendChild(row);

    row.querySelector('.deleteButton').addEventListener('click', () => {
        deleteProduct(index);
    });

    row.querySelector('.editButton').addEventListener('click', () => {
        editProduct(index, product);
    });
}

// Exportar datos a CSV
exportDataButton.addEventListener('click', () => {
    const rows = [['Producto', 'Precio de Compra', 'Precio de Venta', 'Costo de Envío', 'Ganancia', 'Porcentaje de Ganancia']];
    document.querySelectorAll('#productTable tbody tr').forEach(row => {
        const cells = Array.from(row.querySelectorAll('td')).map(cell => cell.textContent);
        rows.push(cells);
    });

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'productos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Eliminar todos los productos
clearAllButton.addEventListener('click', () => {
    if (confirm('¿Estás seguro de que deseas eliminar todos los productos?')) {
        products = []; // Vaciar la lista de productos
        saveProductsToLocalStorage(); // Actualizar localStorage
        loadProducts(); // Recargar la tabla vacía
    }
});

// Escuchar el envío del formulario
productForm.addEventListener('submit', addProduct);

// Escuchar el cambio en el filtro
searchInput.addEventListener('input', filterProducts);

// Inicializar al cargar la página
loadProducts();
