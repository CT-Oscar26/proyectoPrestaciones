document.addEventListener('DOMContentLoaded', () => {
  // Crear 12 filas iniciales
  for(let i = 0; i < 12; i++) {
      agregarFilaSalario(i === 0);
  }
});

function agregarFilaSalario(esPrimeraFila) {
  const tbody = document.querySelector('#tabla-salarios tbody');
  const row = document.createElement('tr');
  
  row.innerHTML = `
      <td>${tbody.children.length + 1}</td>
      <td><input type="number" step="0.01" class="dato-salario"></td>
      <td><input type="number" step="0.01" class="dato-comision"></td>
      <td class="total-cell">0.00</td>
    <td>${esPrimeraFila ? 
       '<button onclick="completarSalarios()">Completar</button>' : 
       ''}
</td>

  `;

  row.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', actualizarCalculos);
  });
  
  tbody.appendChild(row);
}

// función para completar salarios
function completarSalarios() {
  const primeraFila = document.querySelector('#tabla-salarios tbody tr:first-child');
  const salario = primeraFila.querySelector('.dato-salario').value;
  const comision = primeraFila.querySelector('.dato-comision').value;

  document.querySelectorAll('#tabla-salarios tbody tr:not(:first-child)').forEach(fila => {
      fila.querySelector('.dato-salario').value = salario;
      fila.querySelector('.dato-comision').value = comision;
  });
  
  actualizarCalculos(); 
}

function configurarEventos() {
  document.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', actualizarCalculos);
  });
}

  function actualizarCalculos() {
    // Solo actualiza los totales por fila
    document.querySelectorAll('#tabla-salarios tbody tr').forEach(row => {
        const salario = parseFloat(row.querySelector('.dato-salario').value) || 0;
        const comision = parseFloat(row.querySelector('.dato-comision').value) || 0;
        const total = salario + comision;
        row.querySelector('.total-cell').textContent = `RD$${total.toFixed(2)}`;
    });
  }

  document.querySelectorAll("select").forEach(select => {
    select.addEventListener("change", function() {
        if (this.value.toLowerCase() === "si") {
            this.classList.add("green-select");
        } else {
            this.classList.remove("green-select");
        }
    });
});

function calcularTiempoLaborado(fechaIngreso, fechaSalida) {
  if (isNaN(fechaIngreso) || isNaN(fechaSalida)) {
      return "Fechas inválidas";
  }
  
  let anios = fechaSalida.getFullYear() - fechaIngreso.getFullYear();
  let meses = fechaSalida.getMonth() - fechaIngreso.getMonth();
  let dias = fechaSalida.getDate() - fechaIngreso.getDate();
  
  // Ajustar días y meses si 'dias' es negativo
  if (dias < 0) {
      meses--;
      // Obtener el último día del mes anterior
      const ultimoDiaMesAnterior = new Date(
          fechaSalida.getFullYear(),
          fechaSalida.getMonth(),
          0
      ).getDate();
      dias += ultimoDiaMesAnterior;
  }
  
  // Ajustar años si 'meses' es negativo
  if (meses < 0) {
      anios--;
      meses += 12;
  }
  
  return `${anios} año(s), ${meses} mes(es) y ${dias} día(s)`;
}


  function calcularTotal() {
    // Obtener fechas
    const fechaIngreso = new Date(document.getElementById('fecha_ingreso').value);
    const fechaSalida = new Date(document.getElementById('fecha_salida').value);

    // Calcular días laborados en total
    const diferenciaTiempo = fechaSalida - fechaIngreso;
    const diasLaborados = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));
    const añosLaborados = diasLaborados / 365;
    
    // Calcular total de salarios, comisiones y promedios
    let totalSalarios = 0;
    let totalComision = 0;
    
    document.querySelectorAll('#tabla-salarios tbody tr').forEach(row => {
        const salario = parseFloat(row.querySelector('.dato-salario')?.value) || 0;
        const comision = parseFloat(row.querySelector('.dato-comision')?.value) || 0;
    
        totalSalarios += salario;
        totalComision += comision;
    });


    const salarioPromedioMensual = (totalSalarios + totalComision) / 12;
    const salarioPromedioDiario = salarioPromedioMensual / 23.83;

    document.getElementById('final-total-salarios').textContent = `RD$${totalSalarios.toFixed(2)}`;
    document.getElementById('final-promedio-mensual').textContent = `RD$${salarioPromedioMensual.toFixed(2)}`;
    document.getElementById('final-promedio-diario').textContent = `RD$${salarioPromedioDiario.toFixed(2)}`;

    // Calcular preaviso

    let preaviso = 0;
    if (document.getElementById('preAvisado').value === 'no') {
        preaviso = salarioPromedioDiario * 28;
    }
    document.querySelector('#preAvisado + span').textContent = `RD$${preaviso.toFixed(2)}`;

    //Cálculo de la cesantía
    let cesantia = 0;
    if (document.getElementById('cesantia').value === 'si') {
        if (añosLaborados < (3 / 12)) { // Menos de 3 meses
            cesantia = 0;
        } else if (añosLaborados < (6 / 12)) { // Entre 3 y 6 meses
            cesantia = salarioPromedioDiario * 6;
        } else if (añosLaborados < 1) { // Entre 6 meses y 1 año
            cesantia = salarioPromedioDiario * 13;
        } else if (añosLaborados >= 1 && añosLaborados < 5) { // De 1 a 5 años
            cesantia = salarioPromedioDiario * 21 * Math.floor(añosLaborados);
        } else { // Más de 5 años
            cesantia = salarioPromedioDiario * 23 * Math.floor(añosLaborados);
        }
    }
    document.getElementById('cesantiaDespues').textContent = `RD$${cesantia.toFixed(2)}`;

    // Calcular vacaciones
    let vacaciones = 0;
    if (document.getElementById('vacaciones').value === 'no') {
        vacaciones = salarioPromedioDiario * 14;
    }
    document.getElementById('salarioVacaciones').textContent = `RD$${vacaciones.toFixed(2)}`;

    // Subtotal
    let subTotal = preaviso + cesantia + vacaciones;
    document.getElementById('subtotal').textContent = `RD$${subTotal.toFixed(2)}`;

      // Cálculo del salario de Navidad
      let salarioNavidad = 0;
      if (document.getElementById('navidad').value === 'si') {
          // Fecha de inicio del año en curso
          const inicioAño = new Date(fechaSalida.getFullYear(), 0, 1);
          
          // Calcular días trabajados en el año
          let diasTrabajadosEsteAno = Math.ceil((fechaSalida - inicioAño) / (1000 * 3600 * 24));
          // Si ingresó después del inicio del año, contar desde la fecha de ingreso
          if (fechaIngreso > inicioAño) {
              diasTrabajadosEsteAno = Math.ceil((fechaSalida - fechaIngreso) / (1000 * 3600 * 24));
          }
          // Convertir a meses trabajados (dividir entre 30)
          let mesesTrabajadosEsteAno = diasTrabajadosEsteAno / 30;
          // Aplicar la fórmula: proporcional al tiempo trabajado en el año
          salarioNavidad = (salarioPromedioMensual * mesesTrabajadosEsteAno) / 12;
      }
      document.getElementById('salarioNavidad').textContent = `RD$${salarioNavidad.toFixed(2)}`;
      
      //calculo de tiempo laborado
      const textoTiempo = calcularTiempoLaborado(fechaIngreso, fechaSalida);
      document.getElementById('tiempoLaborado').textContent = textoTiempo;

    // Calcular total a recibir
    const totalRecibir = subTotal + salarioNavidad;
    document.getElementById('totalRecibir').textContent = `RD$${totalRecibir.toFixed(2)}`;
}



function limpiarTodo() {
  // Limpiar formulario
  document.getElementById('cedula').value = '';
  document.getElementById('nombre').value = '';
  document.getElementById('empresa').value = '';
  document.getElementById('fecha_ingreso').value = '';
  document.getElementById('fecha_salida').value = '';
  
  // Limpiar tabla
  const tbody = document.querySelector('#tabla-salarios tbody');
  tbody.innerHTML = '';
  
  // Restablecer valores
  document.querySelectorAll('.total-cell').forEach(el => el.textContent = 'RD$0.00');
  document.querySelectorAll('[id^="final-"]').forEach(el => el.textContent = 'RD$0.00');
  document.getElementById('totalRecibir').textContent = 'RD$0.00';
  
  // Volver a crear las 12 filas
  for(let i = 0; i < 12; i++) {
    agregarFilaSalario(i === 0);
}
}