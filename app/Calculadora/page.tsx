'use client';

import { useState } from 'react';

export default function Calculadora() {
    return (
        <div>
            {/* Aquí pega tu HTML original */}
        </div>
    );
}
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
    <title>ColPay Pro - Control Inteligente de Mensualidades</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'colpay-blue': '#1e40af',
                        'colpay-green': '#059669',
                        'colpay-orange': '#ea580c',
                        'colpay-red': '#dc2626',
                        'colpay-gray': '#6b7280',
                        'colpay-dark': '#1f2937'
                    },
                    animation: {
                        'bounce-slow': 'bounce 2s infinite',
                        'pulse-slow': 'pulse 3s infinite',
                        'slide-up': 'slideUp 0.5s ease-out',
                        'count-up': 'countUp 1s ease-out',
                        'confetti': 'confetti 0.8s ease-out'
                    },
                    keyframes: {
                        slideUp: {
                            '0%': { transform: 'translateY(20px)', opacity: '0' },
                            '100%': { transform: 'translateY(0)', opacity: '1' }
                        },
                        countUp: {
                            '0%': { transform: 'scale(0.8)', opacity: '0' },
                            '100%': { transform: 'scale(1)', opacity: '1' }
                        },
                        confetti: {
                            '0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' },
                            '100%': { transform: 'scale(1.2) rotate(360deg)', opacity: '0' }
                        }
                    }
                }
            }
        }

        // Variables globales
        let soundEnabled = true;
        let currentStudentId = 0;
        
        // Base de datos de estudiantes - CORREGIDO A $241,000
        let studentsData = {
            0: {
                name: "Sebastián Jr.",
                grade: "Grado 8°",
                mensualidad: 241000,
                abonos: {},
                historial: []
            }
        };

        // Funciones principales
        function toggleDarkMode() {
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
            playSound();
        }

        function toggleSound() {
            soundEnabled = !soundEnabled;
            const icon = document.getElementById('soundIcon');
            icon.className = soundEnabled ? 'fas fa-volume-up text-colpay-gray dark:text-gray-400' : 'fas fa-volume-mute text-red-500';
            localStorage.setItem('soundEnabled', soundEnabled);
        }

        function playSound() {
            if (soundEnabled) {
                // Crear un beep simple
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
            }
        }

        // Inicialización
        document.addEventListener('DOMContentLoaded', function() {
            // Cargar preferencias
            if (localStorage.getItem('darkMode') === 'true') {
                document.documentElement.classList.add('dark');
            }
            if (localStorage.getItem('soundEnabled') === 'false') {
                soundEnabled = false;
                document.getElementById('soundIcon').className = 'fas fa-volume-mute text-red-500';
            }
            
            // Cargar datos guardados
            const savedData = localStorage.getItem('colpayStudentsData');
            if (savedData) {
                studentsData = JSON.parse(savedData);
            }
            
            // Inicializar todo
            updateStudentSelector();
            switchStudent();
            initializeForm();
        });

        // Funciones de gestión de estudiantes
        function updateStudentSelector() {
            const selector = document.getElementById('studentSelector');
            selector.innerHTML = '';
            
            Object.keys(studentsData).forEach(id => {
                const student = studentsData[id];
                const option = document.createElement('option');
                option.value = id;
                option.textContent = `${student.name} - ${student.grade}`;
                selector.appendChild(option);
            });
            
            selector.value = currentStudentId;
        }

        function switchStudent() {
            const selector = document.getElementById('studentSelector');
            currentStudentId = parseInt(selector.value);
            updateDashboard();
            updateEstadoMensualidades();
            updateHistorial();
        }

        function addStudent() {
            // Crear modal personalizado para mejor UX móvil
            const modalHTML = `
                <div id="addStudentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style="z-index: 999999999 !important; overflow-y: auto !important; position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important;">
                    <div class="glass-effect rounded-2xl p-6 w-full max-w-sm mx-auto my-8" style="max-height: 90vh; overflow-y: auto; position: relative !important; z-index: 999999999 !important;">
                        <h3 class="text-lg font-bold gradient-text mb-4">👨‍🎓 Nuevo Estudiante</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-colpay-gray dark:text-gray-300 mb-2">Nombre del estudiante</label>
                                <input type="text" id="newStudentName" name="newStudentName" placeholder="Ej: María García" 
                                       class="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-colpay-blue focus:border-transparent text-base bg-white dark:bg-gray-700 dark:text-white transition-all" 
                                       style="font-size: 16px !important;">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-colpay-gray dark:text-gray-300 mb-2">Grado</label>
                                <input type="text" id="newStudentGrade" name="newStudentGrade" placeholder="Ej: Grado 9°" 
                                       class="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-colpay-blue focus:border-transparent text-base bg-white dark:bg-gray-700 dark:text-white transition-all" 
                                       style="font-size: 16px !important;">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-colpay-gray dark:text-gray-300 mb-2">Mensualidad</label>
                                <input type="number" id="newStudentMensualidad" name="newStudentMensualidad" value="241000" 
                                       class="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-colpay-blue focus:border-transparent text-base bg-white dark:bg-gray-700 dark:text-white transition-all" 
                                       style="font-size: 16px !important;">
                                <p class="text-xs text-gray-500 mt-1">💡 Puedes cambiar este valor más tarde</p>
                            </div>
                            <div class="flex space-x-3 pt-4">
                                <button onclick="saveNewStudent()" class="flex-1 bg-gradient-to-r from-colpay-green to-green-600 text-white font-medium py-4 rounded-xl hover:shadow-lg transition-all touch-manipulation" style="min-height: 48px;">
                                    <i class="fas fa-plus mr-2"></i>Crear
                                </button>
                                <button onclick="closeAddModal()" class="flex-1 bg-gray-500 text-white font-medium py-4 rounded-xl hover:bg-gray-600 transition-all touch-manipulation" style="min-height: 48px;">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            // Asegurar que el modal esté por encima de todo
            const modal = document.getElementById('addStudentModal');
            modal.style.zIndex = '999999999';
            document.getElementById('newStudentName').focus();
        }
        
        function saveNewStudent() {
            const name = document.getElementById('newStudentName').value.trim();
            const grade = document.getElementById('newStudentGrade').value.trim();
            const mensualidad = parseInt(document.getElementById('newStudentMensualidad').value);
            
            if (!name || !grade || !mensualidad || mensualidad <= 0) {
                alert('❌ Por favor completa todos los campos correctamente');
                return;
            }
            
            const newId = Math.max(...Object.keys(studentsData).map(Number)) + 1;
            
            studentsData[newId] = {
                name: name,
                grade: grade,
                mensualidad: mensualidad,
                abonos: {},
                historial: []
            };
            
            saveData();
            updateStudentSelector();
            currentStudentId = newId;
            document.getElementById('studentSelector').value = newId;
            switchStudent();
            closeAddModal();
            playSound();
            
            alert(`✅ ¡${name} agregado exitosamente!\nMensualidad: $${mensualidad.toLocaleString()}`);
        }
        
        function closeAddModal() {
            const modal = document.getElementById('addStudentModal');
            if (modal) {
                modal.remove();
            }
        }

        function editCurrentStudent() {
            const student = studentsData[currentStudentId];
            
            // Crear modal dinámicamente como el de agregar estudiante
            const modalHTML = `
                <div id="editStudentModalDynamic" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style="z-index: 999999999 !important; overflow-y: auto !important; position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important;">
                    <div class="glass-effect rounded-2xl p-6 w-full max-w-sm mx-auto my-8" style="max-height: 90vh; overflow-y: auto; position: relative !important; z-index: 999999999 !important;">
                        <h3 class="text-lg font-bold gradient-text mb-4">✏️ Editar Estudiante</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-colpay-gray dark:text-gray-300 mb-2">Nombre del estudiante</label>
                                <input type="text" id="editStudentNameDynamic" name="editStudentNameDynamic" value="${student.name}" 
                                       class="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-colpay-blue focus:border-transparent text-base bg-white dark:bg-gray-700 dark:text-white transition-all" 
                                       style="font-size: 16px !important;">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-colpay-gray dark:text-gray-300 mb-2">Grado</label>
                                <input type="text" id="editStudentGradeDynamic" name="editStudentGradeDynamic" value="${student.grade}" 
                                       class="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-colpay-blue focus:border-transparent text-base bg-white dark:bg-gray-700 dark:text-white transition-all" 
                                       style="font-size: 16px !important;">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-colpay-gray dark:text-gray-300 mb-2">Mensualidad</label>
                                <input type="number" id="editStudentMensualidadDynamic" name="editStudentMensualidadDynamic" value="${student.mensualidad}" 
                                       class="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-colpay-blue focus:border-transparent text-base bg-white dark:bg-gray-700 dark:text-white transition-all" 
                                       style="font-size: 16px !important;">
                            </div>
                            <div class="flex space-x-2 pt-4">
                                <button onclick="saveStudentEditDynamic()" class="flex-1 bg-gradient-to-r from-colpay-green to-green-600 text-white font-medium py-4 rounded-xl hover:shadow-lg transition-all touch-manipulation" style="min-height: 48px;">
                                    <i class="fas fa-save mr-2"></i>Guardar
                                </button>
                                <button onclick="deleteStudentDynamic()" class="bg-gradient-to-r from-red-500 to-red-600 text-white font-medium py-4 px-4 rounded-xl hover:shadow-lg transition-all touch-manipulation" style="min-height: 48px;" title="Eliminar estudiante">
                                    <i class="fas fa-trash"></i>
                                </button>
                                <button onclick="closeEditModalDynamic()" class="flex-1 bg-gray-500 text-white font-medium py-4 rounded-xl hover:bg-gray-600 transition-all touch-manipulation" style="min-height: 48px;">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            // Asegurar que el modal esté por encima de todo
            const modal = document.getElementById('editStudentModalDynamic');
            modal.style.zIndex = '999999999';
            document.getElementById('editStudentNameDynamic').focus();
        }

        function deleteStudentDynamic() {
            try {
                const studentId = currentStudentId;
                console.log('🗑️ INICIANDO ELIMINACIÓN DE ESTUDIANTE - ID:', studentId);
                
                // VALIDACIÓN 1: Verificar que el estudiante existe
                if (!studentsData[studentId]) {
                    console.error('❌ ERROR: Estudiante no encontrado con ID:', studentId);
                    alert('❌ ERROR: Estudiante no encontrado');
                    return;
                }
                
                const student = studentsData[studentId];
                console.log('👤 Estudiante a eliminar:', student.name);
                
                // VALIDACIÓN 2: Verificar que no sea el único estudiante
                const totalStudents = Object.keys(studentsData).length;
                if (totalStudents <= 1) {
                    console.log('⚠️ No se puede eliminar el único estudiante');
                    alert('⚠️ NO SE PUEDE ELIMINAR\n\nDebe haber al menos un estudiante en el sistema.\n\n💡 Sugerencia: Agrega otro estudiante antes de eliminar este.');
                    return;
                }
                
                // Calcular datos del estudiante para mostrar en confirmación
                const meses = ['febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre'];
                let totalAbonado = 0;
                let cantidadAbonos = student.historial ? student.historial.length : 0;
                
                meses.forEach(mes => {
                    const abonoMes = student.abonos ? (student.abonos[mes] || 0) : 0;
                    totalAbonado += abonoMes;
                });
                
                // CONFIRMACIÓN ULTRA DETALLADA
                const confirmMessage = `🗑️ ¿ELIMINAR ESTUDIANTE COMPLETAMENTE?\n\n👤 ESTUDIANTE: ${student.name}\n📚 GRADO: ${student.grade}\n💰 MENSUALIDAD: $${student.mensualidad.toLocaleString()}\n\n📊 DATOS QUE SE PERDERÁN:\n• ${cantidadAbonos} abonos registrados\n• $${totalAbonado.toLocaleString()} en pagos totales\n• Todo el historial de pagos\n• Toda la información del estudiante\n\n❌ ¡ESTA ACCIÓN NO SE PUEDE DESHACER!\n\n¿Estás COMPLETAMENTE seguro de eliminar a ${student.name}?`;
                
                if (!confirm(confirmMessage)) {
                    console.log('❌ Usuario canceló la eliminación');
                    return;
                }
                
                console.log('✅ Usuario confirmó eliminación - Procesando...');
                
                // PROCESO DE ELIMINACIÓN
                console.log('🗑️ Eliminando estudiante del sistema...');
                delete studentsData[studentId];
                
                // Verificar que se eliminó correctamente
                if (studentsData[studentId]) {
                    console.error('❌ ERROR: No se pudo eliminar el estudiante');
                    alert('❌ ERROR: No se pudo eliminar el estudiante. Intenta de nuevo.');
                    return;
                }
                
                console.log('✅ Estudiante eliminado del objeto studentsData');
                
                // CAMBIAR ESTUDIANTE ACTIVO si es necesario
                if (currentStudentId == studentId) {
                    console.log('🔄 Cambiando estudiante activo...');
                    const remainingIds = Object.keys(studentsData).map(Number);
                    if (remainingIds.length > 0) {
                        currentStudentId = remainingIds[0];
                        console.log('✅ Nuevo estudiante activo:', currentStudentId);
                    } else {
                        console.error('❌ ERROR: No quedan estudiantes');
                        alert('❌ ERROR CRÍTICO: No quedan estudiantes en el sistema');
                        return;
                    }
                }
                
                // GUARDAR Y ACTUALIZAR TODO
                console.log('💾 Guardando datos actualizados...');
                saveData();
                
                console.log('🔄 Actualizando interfaz completa...');
                updateStudentSelector();
                switchStudent();
                
                // Cerrar modal de edición si está abierto
                closeEditModalDynamic();
                
                console.log('✅ ELIMINACIÓN COMPLETADA EXITOSAMENTE');
                alert(`✅ ¡ESTUDIANTE ELIMINADO!\n\n👤 ${student.name} ha sido eliminado completamente del sistema.\n\n🔄 Sistema actualizado correctamente.\n\n¡Listo! 🚀`);
                playSound();
                
            } catch (error) {
                console.error('💥 ERROR CRÍTICO en deleteStudentDynamic:', error);
                console.error('Stack trace:', error.stack);
                alert(`💥 ERROR CRÍTICO: ${error.message}\n\nPor favor recarga la página e intenta de nuevo.`);
            }
        }

        function saveStudentEditDynamic() {
            const name = document.getElementById('editStudentNameDynamic').value.trim();
            const grade = document.getElementById('editStudentGradeDynamic').value.trim();
            const mensualidad = parseInt(document.getElementById('editStudentMensualidadDynamic').value);
            
            if (!name || !grade || !mensualidad || mensualidad <= 0) {
                alert('❌ Por favor completa todos los campos correctamente');
                return;
            }
            
            studentsData[currentStudentId].name = name;
            studentsData[currentStudentId].grade = grade;
            studentsData[currentStudentId].mensualidad = mensualidad;
            
            saveData();
            updateStudentSelector();
            updateDashboard();
            closeEditModalDynamic();
            playSound();
            
            alert(`✅ ¡${name} actualizado exitosamente!\nMensualidad: $${mensualidad.toLocaleString()}`);
        }
        
        function closeEditModalDynamic() {
            const modal = document.getElementById('editStudentModalDynamic');
            if (modal) {
                modal.remove();
            }
        }

        // Funciones de cálculo y actualización
        function updateDashboard() {
            const student = studentsData[currentStudentId];
            if (!student) return;
            
            const meses = ['febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre'];
            
            let totalCausadas = meses.length;
            let totalAbonado = 0;
            let mesesCompletos = 0;
            
            console.log('Actualizando dashboard para:', student.name);
            console.log('Abonos actuales:', student.abonos);
            
            meses.forEach(mes => {
                const abonoMes = student.abonos[mes] || 0;
                totalAbonado += abonoMes;
                if (abonoMes >= student.mensualidad) {
                    mesesCompletos++;
                }
            });
            
            const saldoPendiente = Math.max(0, (totalCausadas * student.mensualidad) - totalAbonado);
            const porcentaje = Math.min(100, Math.round((totalAbonado / (totalCausadas * student.mensualidad)) * 100));
            
            console.log('Total abonado:', totalAbonado);
            console.log('Porcentaje:', porcentaje);
            
            // Actualizar elementos con animación
            const elements = {
                'totalCausadas': totalCausadas,
                'totalAbonado': '$' + totalAbonado.toLocaleString(),
                'saldoPendiente': '$' + saldoPendiente.toLocaleString(),
                'mesesCubiertos': `${mesesCompletos}/${totalCausadas}`,
                'porcentajePago': porcentaje + '%'
            };
            
            Object.keys(elements).forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = elements[id];
                    element.classList.add('animate-pulse');
                    setTimeout(() => element.classList.remove('animate-pulse'), 1000);
                }
            });
            
            // Actualizar barra de progreso
            const barraProgreso = document.getElementById('barraProgreso');
            if (barraProgreso) {
                barraProgreso.style.width = porcentaje + '%';
            }
            
            // Mensaje motivacional
            const messages = [
                '¡Excelente! Vas muy bien 🎉',
                '¡Buen progreso! Sigue así 💪',
                '¡Ya casi! Un poquito más 🚀',
                '¡Vamos! Tú puedes lograrlo ⭐'
            ];
            const messageIndex = Math.floor(porcentaje / 25);
            const motivationalElement = document.getElementById('motivationalMessage');
            if (motivationalElement) {
                motivationalElement.textContent = messages[Math.min(messageIndex, 3)];
            }
            
            // Calcular intereses por mora (configurable)
            const tasaInteres = parseFloat(localStorage.getItem('tasaInteresMora') || '0.02');
            const intereses = Math.round(saldoPendiente * tasaInteres);
            const interesesElement = document.getElementById('interesesMora');
            if (interesesElement) {
                interesesElement.textContent = '$' + intereses.toLocaleString();
            }
            
            // Mostrar tasa actual
            const tasaElement = document.getElementById('tasaInteresActual');
            if (tasaElement) {
                tasaElement.textContent = (tasaInteres * 100).toFixed(1) + '%';
            }
        }

        function updateEstadoMensualidades() {
            const student = studentsData[currentStudentId];
            const meses = ['febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre'];
            const container = document.getElementById('estadoMensualidades');
            
            container.innerHTML = '';
            
            meses.forEach(mes => {
                const abonado = student.abonos[mes] || 0;
                const pendiente = student.mensualidad - abonado;
                const completo = abonado >= student.mensualidad;
                
                const div = document.createElement('div');
                div.className = `flex items-center justify-between p-3 rounded-xl border-l-4 ${
                    completo ? 'bg-green-50 dark:bg-green-900 border-green-500' : 
                    abonado > 0 ? 'bg-yellow-50 dark:bg-yellow-900 border-yellow-500' : 
                    'bg-red-50 dark:bg-red-900 border-red-500'
                }`;
                
                div.innerHTML = `
                    <div>
                        <p class="font-medium text-gray-800 dark:text-gray-200 capitalize">${mes}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            ${completo ? '✅ Completo' : 
                              abonado > 0 ? `💰 Abonado: $${abonado.toLocaleString()}` : 
                              '❌ Sin abonos'}
                        </p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold ${completo ? 'text-green-600' : 'text-red-600'}">
                            ${completo ? '$0' : '$' + pendiente.toLocaleString()}
                        </p>
                        <p class="text-xs text-gray-500">
                            ${completo ? 'Pagado' : 'Pendiente'}
                        </p>
                    </div>
                `;
                
                container.appendChild(div);
            });
        }

        function updateHistorial() {
            const student = studentsData[currentStudentId];
            const container = document.getElementById('historialAbonos');
            
            if (student.historial.length === 0) {
                container.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400 py-4">No hay abonos registrados</p>';
                return;
            }
            
            container.innerHTML = '';
            
            student.historial.slice(-5).reverse().forEach((abono, index) => {
                const originalIndex = student.historial.length - 1 - index;
                const div = document.createElement('div');
                div.className = 'flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl';
                
                div.innerHTML = `
                    <div class="flex-1">
                        <p class="font-medium text-gray-800 dark:text-gray-200 capitalize">${abono.mes}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">${abono.fecha}</p>
                        ${abono.tipo ? `<p class="text-xs text-blue-600 dark:text-blue-400">${abono.tipo}</p>` : ''}
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-colpay-green">$${abono.valor.toLocaleString()}</p>
                        <p class="text-xs text-gray-500">Abono</p>
                    </div>
                    <div class="flex space-x-1 ml-2">
                        <button onclick="eliminarAbono(${originalIndex})" class="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-colors" title="Eliminar este abono" aria-label="Eliminar abono de ${abono.mes}">
                            <span class="sr-only">Eliminar abono</span>
                            <i class="fas fa-trash text-sm" aria-hidden="true"></i>
                        </button>
                    </div>
                `;
                
                container.appendChild(div);
            });
        }

        // Función para registrar abonos con distribución inteligente
        function initializeForm() {
            console.log('🔧 Inicializando formulario de abonos...');
            const form = document.getElementById('abonoForm');
            if (form) {
                console.log('✅ Formulario encontrado, agregando event listener...');
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    console.log('📝 PROCESANDO NUEVO ABONO...');
                    
                    const mes = document.getElementById('mesAbono').value;
                    const valor = parseInt(document.getElementById('valorAbono').value);
                    const distribuir = document.getElementById('distribuirAutomatico').checked;
                    
                    console.log('📋 Datos del formulario:', { mes, valor, distribuir });
                    
                    if (!mes || !valor || valor <= 0) {
                        console.error('❌ Datos inválidos:', { mes, valor });
                        alert('❌ Por favor completa todos los campos con valores válidos');
                        return;
                    }
                    
                    const student = studentsData[currentStudentId];
                    console.log('👤 Estudiante actual:', student.name);
                    
                    // Inicializar propiedades si no existen
                    if (!student.abonos) {
                        student.abonos = {};
                        console.log('🔧 Inicializando student.abonos');
                    }
                    if (!student.historial) {
                        student.historial = [];
                        console.log('🔧 Inicializando student.historial');
                    }
                    
                    if (distribuir) {
                        console.log('🔄 Procesando distribución automática...');
                        // Distribución automática desde el mes más antiguo
                        distribuirPagoAutomatico(valor, mes);
                    } else {
                        console.log('💰 Procesando pago directo...');
                        // Pago directo al mes seleccionado
                        if (!student.abonos[mes]) {
                            student.abonos[mes] = 0;
                        }
                        student.abonos[mes] += valor;
                        
                        // Agregar al historial
                        student.historial.push({
                            mes: mes,
                            valor: valor,
                            fecha: new Date().toLocaleDateString(),
                            tipo: 'Pago directo'
                        });
                        
                        console.log(`✅ Abono registrado: $${valor.toLocaleString()} para ${mes}`);
                    }
                    
                    // Limpiar formulario
                    document.getElementById('mesAbono').value = '';
                    document.getElementById('valorAbono').value = '';
                    document.getElementById('distribuirAutomatico').checked = false;
                    
                    // Actualizar interfaz inmediatamente
                    console.log('🔄 Actualizando interfaz...');
                    saveData();
                    updateDashboard();
                    updateEstadoMensualidades();
                    updateHistorial();
                    playSound();
                    
                    // Mostrar mensaje de confirmación
                    alert(`✅ ¡Abono registrado exitosamente!\n\n💰 $${valor.toLocaleString()} ${distribuir ? 'distribuido automáticamente' : 'para ' + mes}\n\n🔄 Dashboard actualizado`);
                    
                    // Mostrar confetti si se completa un mes
                    checkForCompletedMonths();
                });
            } else {
                console.error('❌ ERROR: No se encontró el formulario abonoForm');
            }
        }

        // Función para distribuir pagos automáticamente
        function distribuirPagoAutomatico(valor, mesInicio) {
            const student = studentsData[currentStudentId];
            const meses = ['febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre'];
            
            let montoRestante = valor;
            let mesesAfectados = [];
            
            console.log(`🔄 INICIANDO DISTRIBUCIÓN: $${valor.toLocaleString()} desde ${mesInicio}`);
            console.log('💰 Abonos actuales antes:', JSON.stringify(student.abonos));
            
            // Distribuir desde febrero hacia adelante (orden cronológico)
            for (let mes of meses) {
                if (montoRestante <= 0) break;
                
                const abonado = student.abonos[mes] || 0;
                const pendiente = student.mensualidad - abonado;
                
                console.log(`📅 ${mes}: Abonado=$${abonado.toLocaleString()}, Pendiente=$${pendiente.toLocaleString()}`);
                
                if (pendiente > 0) {
                    const abonoMes = Math.min(pendiente, montoRestante);
                    
                    if (!student.abonos[mes]) {
                        student.abonos[mes] = 0;
                    }
                    student.abonos[mes] += abonoMes;
                    
                    mesesAfectados.push({
                        mes: mes,
                        abono: abonoMes,
                        completo: student.abonos[mes] >= student.mensualidad
                    });
                    
                    montoRestante -= abonoMes;
                    console.log(`✅ ${mes}: +$${abonoMes.toLocaleString()}, Total mes: $${student.abonos[mes].toLocaleString()}, Restante: $${montoRestante.toLocaleString()}`);
                }
            }
            
            // Si sobra dinero, agregarlo al último mes disponible
            if (montoRestante > 0) {
                console.log(`💡 SOBRANTE: $${montoRestante.toLocaleString()} - Agregando a noviembre`);
                if (!student.abonos['noviembre']) {
                    student.abonos['noviembre'] = 0;
                }
                student.abonos['noviembre'] += montoRestante;
                
                // Buscar si ya afectamos noviembre
                const noviembreIndex = mesesAfectados.findIndex(m => m.mes === 'noviembre');
                if (noviembreIndex >= 0) {
                    mesesAfectados[noviembreIndex].abono += montoRestante;
                } else {
                    mesesAfectados.push({
                        mes: 'noviembre',
                        abono: montoRestante,
                        completo: student.abonos['noviembre'] >= student.mensualidad
                    });
                }
                montoRestante = 0;
            }
            
            // Agregar al historial con detalle de distribución
            student.historial.push({
                mes: mesInicio,
                valor: valor,
                fecha: new Date().toLocaleDateString(),
                tipo: 'Distribución automática',
                detalle: mesesAfectados
            });
            
            console.log('💰 Abonos finales:', JSON.stringify(student.abonos));
            console.log('📋 Meses afectados:', mesesAfectados);
        }

        // Función para verificar meses completados
        function checkForCompletedMonths() {
            const student = studentsData[currentStudentId];
            const meses = ['febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre'];
            
            let mesesCompletos = 0;
            meses.forEach(mes => {
                const abonado = student.abonos[mes] || 0;
                if (abonado >= student.mensualidad) {
                    mesesCompletos++;
                }
            });
            
            if (mesesCompletos > 0) {
                showConfetti();
            }
        }

        function showConfetti() {
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    const confetti = document.createElement('div');
                    confetti.className = 'confetti-particle';
                    confetti.style.left = Math.random() * 100 + '%';
                    confetti.style.top = Math.random() * 100 + '%';
                    confetti.style.backgroundColor = ['#059669', '#1e40af', '#ea580c'][Math.floor(Math.random() * 3)];
                    document.body.appendChild(confetti);
                    
                    setTimeout(() => confetti.remove(), 800);
                }, i * 50);
            }
        }

        function simularAbono() {
            const monto = parseInt(document.getElementById('simuladorMonto').value);
            if (!monto) return;
            
            const student = studentsData[currentStudentId];
            const meses = ['febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre'];
            
            let montoRestante = monto;
            let mesesAfectados = [];
            
            for (let mes of meses) {
                const abonado = student.abonos[mes] || 0;
                const pendiente = student.mensualidad - abonado;
                
                if (pendiente > 0 && montoRestante > 0) {
                    const abonoMes = Math.min(pendiente, montoRestante);
                    mesesAfectados.push({mes, abono: abonoMes, completo: abonoMes === pendiente});
                    montoRestante -= abonoMes;
                }
            }
            
            let resultado = `<div class="space-y-2">`;
            resultado += `<p class="font-bold">Con $${monto.toLocaleString()} podrías:</p>`;
            
            mesesAfectados.forEach(item => {
                resultado += `<p class="text-sm">• ${item.mes}: +$${item.abono.toLocaleString()} ${item.completo ? '✅' : '⏳'}</p>`;
            });
            
            if (montoRestante > 0) {
                resultado += `<p class="text-sm text-gray-600">Sobrante: $${montoRestante.toLocaleString()}</p>`;
            }
            
            resultado += `</div>`;
            
            document.getElementById('detalleSimulacion').innerHTML = resultado;
            document.getElementById('resultadoSimulacion').classList.remove('hidden');
        }

        function eliminarAbono(index) {
            try {
                console.log('🗑️ INICIANDO ELIMINACIÓN - Index:', index);
                
                const student = studentsData[currentStudentId];
                console.log('👤 Estudiante actual:', student?.name);
                
                // VALIDACIÓN 1: Verificar estudiante
                if (!student) {
                    console.error('❌ ERROR: Estudiante no encontrado');
                    alert('❌ ERROR: No se encontró el estudiante actual');
                    return;
                }
                
                // VALIDACIÓN 2: Inicializar propiedades si no existen
                if (!student.abonos) {
                    student.abonos = {};
                    console.log('🔧 Inicializando student.abonos');
                }
                if (!student.historial) {
                    student.historial = [];
                    console.log('🔧 Inicializando student.historial');
                }
                
                // VALIDACIÓN 3: Verificar que hay abonos
                if (student.historial.length === 0) {
                    console.log('ℹ️ No hay abonos en el historial');
                    alert('ℹ️ No hay abonos para eliminar');
                    return;
                }
                
                // VALIDACIÓN 4: Verificar índice válido
                if (index < 0 || index >= student.historial.length) {
                    console.error('❌ ERROR: Índice inválido:', index, 'Total:', student.historial.length);
                    alert('❌ ERROR: Abono no encontrado');
                    return;
                }
                
                const abono = student.historial[index];
                console.log('📋 Abono a eliminar:', abono);
                
                // VALIDACIÓN 5: Verificar que el abono existe
                if (!abono || !abono.valor || !abono.mes) {
                    console.error('❌ ERROR: Abono inválido:', abono);
                    alert('❌ ERROR: Datos del abono inválidos');
                    return;
                }
                
                console.log('💰 Estado ANTES de eliminar:', JSON.stringify(student.abonos));
                
                // Confirmación simplificada y clara
                const userConfirmed = confirm(`🗑️ ¿ELIMINAR ESTE ABONO?\n\n💰 Valor: $${abono.valor.toLocaleString()}\n📅 Mes: ${abono.mes}\n📝 Tipo: ${abono.tipo || 'Pago directo'}\n\n⚠️ Esta acción no se puede deshacer.\n\n¿Continuar?`);
                
                if (!userConfirmed) {
                    console.log('ℹ️ Usuario canceló la eliminación');
                    return;
                }
                
                console.log('✅ Usuario confirmó eliminación - Procesando...');
                
                // PROCESO DE ELIMINACIÓN
                if (abono.tipo === 'Distribución automática' && abono.detalle && Array.isArray(abono.detalle)) {
                    console.log('🔄 PROCESANDO: Distribución automática');
                    console.log('📊 Detalle de distribución:', abono.detalle);
                    
                    // Revertir cada mes afectado
                    abono.detalle.forEach((detalle, i) => {
                        console.log(`🔄 Procesando detalle ${i + 1}:`, detalle);
                        
                        if (detalle && detalle.mes && typeof detalle.abono === 'number' && detalle.abono > 0) {
                            const mesActual = detalle.mes;
                            const abonoARestar = detalle.abono;
                            const valorAnterior = student.abonos[mesActual] || 0;
                            
                            console.log(`📅 ${mesActual}: Valor anterior=$${valorAnterior.toLocaleString()}, A restar=$${abonoARestar.toLocaleString()}`);
                            
                            if (valorAnterior >= abonoARestar) {
                                const nuevoValor = valorAnterior - abonoARestar;
                                
                                if (nuevoValor > 0) {
                                    student.abonos[mesActual] = nuevoValor;
                                    console.log(`✅ ${mesActual}: Nuevo valor=$${nuevoValor.toLocaleString()}`);
                                } else {
                                    delete student.abonos[mesActual];
                                    console.log(`🗑️ ${mesActual}: Eliminado (valor=0)`);
                                }
                            } else {
                                console.warn(`⚠️ ${mesActual}: Valor anterior menor que el a restar`);
                                delete student.abonos[mesActual];
                            }
                        } else {
                            console.warn('⚠️ Detalle inválido:', detalle);
                        }
                    });
                    
                } else {
                    console.log('🔄 PROCESANDO: Pago directo');
                    const mesAbono = abono.mes;
                    const valorAbono = abono.valor;
                    const valorAnterior = student.abonos[mesAbono] || 0;
                    
                    console.log(`📅 ${mesAbono}: Valor anterior=$${valorAnterior.toLocaleString()}, A restar=$${valorAbono.toLocaleString()}`);
                    
                    if (valorAnterior >= valorAbono) {
                        const nuevoValor = valorAnterior - valorAbono;
                        
                        if (nuevoValor > 0) {
                            student.abonos[mesAbono] = nuevoValor;
                            console.log(`✅ ${mesAbono}: Nuevo valor=$${nuevoValor.toLocaleString()}`);
                        } else {
                            delete student.abonos[mesAbono];
                            console.log(`🗑️ ${mesAbono}: Eliminado (valor=0)`);
                        }
                    } else {
                        console.warn(`⚠️ ${mesAbono}: Valor anterior menor que el a restar`);
                        delete student.abonos[mesAbono];
                    }
                }
                
                // Eliminar del historial
                console.log('🗑️ Eliminando del historial...');
                student.historial.splice(index, 1);
                console.log('✅ Eliminado del historial. Nuevo total:', student.historial.length);
                
                console.log('💰 Estado DESPUÉS de eliminar:', JSON.stringify(student.abonos));
                
                // Guardar y actualizar TODO
                console.log('💾 Guardando datos...');
                saveData();
                
                console.log('🔄 Actualizando interfaz...');
                updateDashboard();
                updateEstadoMensualidades();
                updateHistorial();
                playSound();
                
                console.log('✅ ELIMINACIÓN COMPLETADA EXITOSAMENTE');
                alert(`✅ ¡ABONO ELIMINADO!\n\n💰 $${abono.valor.toLocaleString()} de ${abono.mes}\n🔄 Dashboard actualizado\n\n¡Listo! 🚀`);
                
            } catch (error) {
                console.error('💥 ERROR CRÍTICO en eliminarAbono:', error);
                console.error('Stack trace:', error.stack);
                alert(`💥 ERROR CRÍTICO: ${error.message}\n\nPor favor recarga la página e intenta de nuevo.`);
            }
        }

        function clearHistory() {
            try {
                console.log('🗑️ INICIANDO LIMPIEZA COMPLETA');
                
                const student = studentsData[currentStudentId];
                console.log('👤 Estudiante actual:', student?.name);
                
                // VALIDACIÓN 1: Verificar que el estudiante existe
                if (!student) {
                    console.error('❌ ERROR: Estudiante no encontrado');
                    alert('❌ ERROR: No se encontró el estudiante actual');
                    return;
                }
                
                // VALIDACIÓN 2: Inicializar propiedades si no existen
                if (!student.abonos) {
                    student.abonos = {};
                    console.log('🔧 Inicializando student.abonos');
                }
                if (!student.historial) {
                    student.historial = [];
                    console.log('🔧 Inicializando student.historial');
                }
                
                // ANÁLISIS DETALLADO
                const meses = ['febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre'];
                let totalAbonado = 0;
                let cantidadMesesConSaldo = 0;
                
                meses.forEach(mes => {
                    const abonoMes = student.abonos[mes] || 0;
                    if (abonoMes > 0) {
                        totalAbonado += abonoMes;
                        cantidadMesesConSaldo++;
                    }
                });
                
                const cantidadAbonos = student.historial.length;
                
                console.log('📊 ESTADO ACTUAL:', {
                    cantidadAbonos: cantidadAbonos,
                    totalAbonado: totalAbonado,
                    cantidadMesesConSaldo: cantidadMesesConSaldo
                });
                
                // VALIDACIÓN 3: Verificar si hay algo que limpiar
                if (cantidadAbonos === 0 && totalAbonado === 0 && cantidadMesesConSaldo === 0) {
                    console.log('ℹ️ No hay nada que limpiar');
                    alert('ℹ️ NO HAY ABONOS PARA ELIMINAR\n\nEl historial ya está completamente vacío.\n\n✨ ¡Todo limpio!');
                    return;
                }
                
                const confirmMessage = `🗑️ ¿LIMPIAR TODO EL HISTORIAL COMPLETAMENTE?\n\n⚠️ ESTO ELIMINARÁ:\n• ${cantidadAbonos} abonos del historial\n• $${totalAbonado.toLocaleString()} en pagos totales\n• ${cantidadMesesConSaldo} meses con saldos\n• Todos los datos de todos los meses\n\n❌ ¡ESTA ACCIÓN NO SE PUEDE DESHACER!\n\n¿Estás COMPLETAMENTE seguro?`;
                
                if (confirm(confirmMessage)) {
                    console.log('✅ Usuario confirmó limpieza completa');
                    
                    console.log('🗑️ EJECUTANDO LIMPIEZA COMPLETA...');
                    
                    // MÉTODO ULTRA FORZADO
                    const studentRef = studentsData[currentStudentId];
                    
                    // Limpiar todos los meses
                    meses.forEach(mes => {
                        if (studentRef.abonos[mes]) {
                            console.log(`🧹 Limpiando ${mes}: $${studentRef.abonos[mes].toLocaleString()}`);
                            delete studentRef.abonos[mes];
                        }
                    });
                    
                    // Recrear objetos completamente vacíos
                    studentRef.abonos = {};
                    studentRef.historial = [];
                    
                    // Verificación inmediata
                    const verificacionAbonos = Object.keys(studentRef.abonos).length;
                    const verificacionHistorial = studentRef.historial.length;
                    let verificacionTotalAbonado = 0;
                    
                    meses.forEach(mes => {
                        const abonoMes = studentRef.abonos[mes] || 0;
                        verificacionTotalAbonado += abonoMes;
                    });
                    
                    console.log('🔍 VERIFICACIÓN:', {
                        abonosVacios: verificacionAbonos === 0,
                        historialVacio: verificacionHistorial === 0,
                        totalCero: verificacionTotalAbonado === 0
                    });
                    
                    // Guardar y actualizar
                    console.log('💾 Guardando datos...');
                    saveData();
                    
                    console.log('🔄 Actualizando interfaz...');
                    updateDashboard();
                    updateEstadoMensualidades();
                    updateHistorial();
                    playSound();
                    
                    const verificacionFinal = verificacionAbonos === 0 && verificacionHistorial === 0 && verificacionTotalAbonado === 0;
                    
                    if (verificacionFinal) {
                        console.log('✅ LIMPIEZA COMPLETADA EXITOSAMENTE');
                        alert(`🗑️ ¡HISTORIAL COMPLETAMENTE ELIMINADO!\n\n✅ Se borraron exitosamente:\n• ${cantidadAbonos} abonos del historial\n• $${totalAbonado.toLocaleString()} en pagos totales\n• ${cantidadMesesConSaldo} meses con saldos\n• Todos los datos de todos los meses\n\n🔄 Dashboard reiniciado a CERO.\n\n¡Listo para empezar de nuevo! 🚀`);
                    } else {
                        console.error('❌ ERROR: La limpieza no se completó correctamente');
                        alert('❌ ERROR: La limpieza no se completó correctamente. Por favor recarga la página e intenta de nuevo.');
                    }
                    
                } else {
                    console.log('❌ Usuario canceló la limpieza');
                }
                
            } catch (error) {
                console.error('💥 ERROR CRÍTICO en clearHistory:', error);
                console.error('Stack trace:', error.stack);
                alert(`💥 ERROR CRÍTICO: ${error.message}\n\nPor favor recarga la página e intenta de nuevo.`);
            }
        }

        function confirmarNuevoAno() {
            const nuevaMensualidad = parseInt(document.getElementById('nuevaMensualidad').value);
            const nuevoAno = parseInt(document.getElementById('nuevoAno').value);
            
            if (!nuevaMensualidad || !nuevoAno) {
                alert('Por favor completa todos los campos');
                return;
            }
            
            if (confirm(`¿Estás seguro de iniciar el año ${nuevoAno} con mensualidad de $${nuevaMensualidad.toLocaleString()}? Esto borrará todos los datos actuales.`)) {
                Object.keys(studentsData).forEach(id => {
                    studentsData[id].mensualidad = nuevaMensualidad;
                    studentsData[id].abonos = {};
                    studentsData[id].historial = [];
                });
                
                saveData();
                updateDashboard();
                updateEstadoMensualidades();
                updateHistorial();
                
                document.getElementById('nuevaMensualidad').value = '';
                document.getElementById('nuevoAno').value = '';
                
                alert(`¡Año escolar ${nuevoAno} iniciado correctamente!`);
                playSound();
            }
        }

        function exportToPDF() {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            const student = studentsData[currentStudentId];
            
            doc.setFontSize(20);
            doc.text('ColPay Pro - Reporte', 20, 30);
            
            doc.setFontSize(14);
            doc.text(`Estudiante: ${student.name}`, 20, 50);
            doc.text(`Grado: ${student.grade}`, 20, 65);
            doc.text(`Mensualidad: $${student.mensualidad.toLocaleString()}`, 20, 80);
            
            doc.text('Historial de Abonos:', 20, 100);
            
            let y = 115;
            student.historial.forEach(abono => {
                doc.setFontSize(10);
                doc.text(`${abono.fecha} - ${abono.mes}: $${abono.valor.toLocaleString()}`, 25, y);
                y += 15;
            });
            
            doc.save(`ColPay_${student.name}_${new Date().toLocaleDateString()}.pdf`);
            playSound();
        }

        function configurarIntereses() {
            const tasaActual = parseFloat(localStorage.getItem('tasaInteresMora') || '0.02') * 100;
            
            // Crear un modal personalizado para mejor UX
            const modalHTML = `
                <div id="configInteresesModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style="z-index: 999999999 !important; position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important;">
                    <div class="glass-effect rounded-2xl p-6 w-full max-w-sm" style="position: relative !important; z-index: 999999999 !important;">
                        <h3 class="text-lg font-bold gradient-text mb-4">⚙️ Configurar Intereses</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-colpay-gray dark:text-gray-300 mb-2">
                                    Tasa actual: ${tasaActual.toFixed(1)}%
                                </label>
                                <input type="number" id="nuevaTasaInput" value="${tasaActual.toFixed(1)}" step="0.1" min="0" max="50"
                                       class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-colpay-blue focus:border-transparent text-base bg-white dark:bg-gray-700 dark:text-white transition-all"
                                       placeholder="Ejemplo: 2.5">
                                <p class="text-xs text-gray-500 mt-1">Ingresa el porcentaje (ejemplo: 2.5 para 2.5%)</p>
                            </div>
                            <div class="flex space-x-3">
                                <button onclick="guardarNuevaTasa()" class="flex-1 bg-gradient-to-r from-colpay-green to-green-600 text-white font-medium py-3 rounded-xl hover:shadow-lg transition-all">
                                    <i class="fas fa-save mr-2"></i>Guardar
                                </button>
                                <button onclick="cerrarConfigIntereses()" class="flex-1 bg-gray-500 text-white font-medium py-3 rounded-xl hover:bg-gray-600 transition-all">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            document.getElementById('nuevaTasaInput').focus();
        }
        
        function guardarNuevaTasa() {
            const nuevaTasa = parseFloat(document.getElementById('nuevaTasaInput').value);
            
            if (isNaN(nuevaTasa) || nuevaTasa < 0 || nuevaTasa > 50) {
                alert('Por favor ingresa una tasa válida entre 0% y 50%');
                return;
            }
            
            const tasaDecimal = nuevaTasa / 100;
            localStorage.setItem('tasaInteresMora', tasaDecimal.toString());
            updateDashboard();
            cerrarConfigIntereses();
            alert(`✅ Tasa de interés actualizada a ${nuevaTasa}%`);
            playSound();
        }
        
        function cerrarConfigIntereses() {
            const modal = document.getElementById('configInteresesModal');
            if (modal) {
                modal.remove();
            }
        }

        function saveData() {
            localStorage.setItem('colpayStudentsData', JSON.stringify(studentsData));
        }
    </script>
    <style>
        .glass-effect {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            width: -webkit-fill-available;
            width: stretch;
        }
        .dark .glass-effect {
            background: rgba(31, 41, 55, 0.95);
            border: 1px solid rgba(75, 85, 99, 0.2);
        }
        .gradient-text {
            background: linear-gradient(135deg, #1e40af, #059669);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .hover-lift {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .watermark {
            position: fixed;
            bottom: 10px;
            right: 10px;
            opacity: 0.3;
            font-size: 10px;
            color: #6b7280;
            pointer-events: none;
            z-index: 1000;
            -webkit-user-select: none;
            user-select: none;
        }
        .confetti-particle {
            position: absolute;
            width: 8px;
            height: 8px;
            background: #059669;
            animation: confetti 0.8s ease-out forwards;
        }
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 min-h-screen transition-all duration-500">
    
    <!-- Watermark -->
    <div class="watermark">ColPay Pro v1.0</div>
    
    <!-- Header Premium -->
    <header class="glass-effect shadow-2xl sticky top-0 z-50">
        <div class="max-w-md mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-colpay-blue to-colpay-green rounded-xl flex items-center justify-center shadow-lg" role="img" aria-label="ColPay Pro Logo">
                        <i class="fas fa-graduation-cap text-white text-lg" aria-hidden="true"></i>
                    </div>
                    <div>
                        <h1 class="text-xl font-bold gradient-text">ColPay Pro</h1>
                        <p class="text-xs text-colpay-gray dark:text-gray-400">Control Inteligente</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="toggleDarkMode()" class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Cambiar modo oscuro/claro" aria-label="Cambiar modo oscuro/claro">
                        <span class="sr-only">Cambiar modo oscuro/claro</span>
                        <i class="fas fa-moon dark:hidden text-colpay-gray" aria-hidden="true"></i>
                        <i class="fas fa-sun hidden dark:inline text-yellow-400" aria-hidden="true"></i>
                    </button>
                    <button onclick="toggleSound()" class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Activar/desactivar sonido" aria-label="Activar/desactivar sonido">
                        <span class="sr-only">Activar/desactivar sonido</span>
                        <i id="soundIcon" class="fas fa-volume-up text-colpay-gray dark:text-gray-400" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
        </div>
    </header>

    <main class="max-w-md mx-auto px-4 py-6 space-y-6">
        
        <!-- Selector de Estudiante -->
        <div class="glass-effect rounded-2xl shadow-xl p-4 hover-lift animate-slide-up">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-bold text-colpay-blue dark:text-blue-400">👨‍🎓 Estudiante Activo</h2>
                <div class="flex space-x-2">
                    <button onclick="editCurrentStudent()" class="text-colpay-blue hover:text-blue-600 transition-colors" title="Editar estudiante" aria-label="Editar estudiante actual">
                        <span class="sr-only">Editar estudiante</span>
                        <i class="fas fa-edit text-xl" aria-hidden="true"></i>
                    </button>
                    <button onclick="addStudent()" class="text-colpay-green hover:text-green-600 transition-colors" title="Agregar nuevo estudiante" aria-label="Agregar nuevo estudiante">
                        <span class="sr-only">Agregar estudiante</span>
                        <i class="fas fa-plus-circle text-xl" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
            
            <select id="studentSelector" name="studentSelector" onchange="switchStudent()" class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-colpay-blue focus:border-transparent text-base bg-white dark:bg-gray-700 dark:text-white transition-all">
                <!-- Se llenará dinámicamente -->
            </select>
        </div>

        <!-- Resumen General Premium -->
        <div class="glass-effect rounded-2xl shadow-xl p-4 hover-lift animate-slide-up">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold gradient-text">📊 Dashboard Financiero</h2>
                <button onclick="exportToPDF()" class="bg-gradient-to-r from-colpay-blue to-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:shadow-lg transition-all" title="Exportar reporte a PDF" aria-label="Exportar reporte a PDF">
                    <i class="fas fa-download mr-1" aria-hidden="true"></i> PDF
                </button>
            </div>
            
            <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl p-3 text-center hover-lift">
                    <p class="text-xs text-colpay-gray dark:text-gray-300 font-medium">CAUSADAS</p>
                    <p id="totalCausadas" class="text-2xl font-bold text-colpay-blue dark:text-blue-400 animate-count-up">0</p>
                    <div class="text-xs text-colpay-gray dark:text-gray-400 mt-1">
                        <i class="fas fa-calendar-alt mr-1"></i>meses
                    </div>
                </div>
                <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-xl p-3 text-center hover-lift">
                    <p class="text-xs text-colpay-gray dark:text-gray-300 font-medium">ABONADO</p>
                    <p id="totalAbonado" class="text-2xl font-bold text-colpay-green dark:text-green-400 animate-count-up">$0</p>
                    <div class="text-xs text-colpay-gray dark:text-gray-400 mt-1">
                        <i class="fas fa-check-circle mr-1"></i>pagado
                    </div>
                </div>
                <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-xl p-3 text-center hover-lift">
                    <p class="text-xs text-colpay-gray dark:text-gray-300 font-medium">PENDIENTE</p>
                    <p id="saldoPendiente" class="text-2xl font-bold text-colpay-orange dark:text-orange-400 animate-count-up">$0</p>
                    <div class="text-xs text-colpay-gray dark:text-gray-400 mt-1">
                        <i class="fas fa-clock mr-1"></i>por pagar
                    </div>
                </div>
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-xl p-3 text-center hover-lift">
                    <p class="text-xs text-colpay-gray dark:text-gray-300 font-medium">PROGRESO</p>
                    <p id="mesesCubiertos" class="text-2xl font-bold text-purple-600 dark:text-purple-400 animate-count-up">0/10</p>
                    <div class="text-xs text-colpay-gray dark:text-gray-400 mt-1">
                        <i class="fas fa-trophy mr-1"></i>completos
                    </div>
                </div>
            </div>

            <!-- Barra de Progreso Premium -->
            <div class="mb-4">
                <div class="flex justify-between text-sm text-colpay-gray dark:text-gray-300 mb-2">
                    <span class="flex items-center">
                        <i class="fas fa-chart-line mr-2"></i>Progreso Anual
                    </span>
                    <span id="porcentajePago" class="font-bold">0%</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div id="barraProgreso" class="bg-gradient-to-r from-colpay-green via-green-400 to-emerald-500 h-4 rounded-full transition-all duration-1000 ease-out relative" style="width: 0%">
                        <div class="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
                    </div>
                </div>
                <div class="text-center mt-2">
                    <span id="motivationalMessage" class="text-xs text-colpay-gray dark:text-gray-400 italic"></span>
                </div>
            </div>

            <!-- Calculadora de Intereses por Mora -->
            <div class="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-xl p-3">
                <div class="flex items-center justify-between mb-2">
                    <div>
                        <p class="text-sm font-medium text-red-800 dark:text-red-300">Intereses por Mora</p>
                        <p id="interesesMora" class="text-lg font-bold text-red-600 dark:text-red-400">$0</p>
                    </div>
                    <button onclick="configurarIntereses()" class="text-red-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900" title="Configurar tasa de interés" aria-label="Configurar tasa de interés por mora">
                        <span class="sr-only">Configurar intereses</span>
                        <i class="fas fa-cog text-xl" aria-hidden="true"></i>
                    </button>
                </div>
                <div class="flex items-center justify-between text-xs">
                    <span class="text-red-700 dark:text-red-300">Tasa actual:</span>
                    <span id="tasaInteresActual" class="font-bold text-red-600 dark:text-red-400">2.0%</span>
                </div>
            </div>
        </div>

        <!-- Estado de Mensualidades Premium -->
        <div class="glass-effect rounded-2xl shadow-xl p-4 hover-lift animate-slide-up">
            <h2 class="text-lg font-bold gradient-text mb-4 flex items-center">
                <i class="fas fa-calendar-check mr-2"></i>Estado de Mensualidades
            </h2>
            
            <div class="space-y-3" id="estadoMensualidades">
                <!-- Se llenará dinámicamente -->
            </div>
        </div>

        <!-- Registrar Nuevo Abono Premium -->
        <div class="glass-effect rounded-2xl shadow-xl p-4 hover-lift animate-slide-up">
            <h2 class="text-lg font-bold gradient-text mb-4 flex items-center">
                <i class="fas fa-credit-card mr-2"></i>Registrar Nuevo Abono
            </h2>
            
            <form id="abonoForm" class="space-y-4">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-colpay-gray dark:text-gray-300 mb-2">
                            <i class="fas fa-calendar mr-1"></i>Mes del Abono
                        </label>
                        <select id="mesAbono" name="mesAbono" class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-colpay-blue focus:border-transparent text-base bg-white dark:bg-gray-700 dark:text-white transition-all">
                            <option value="">Seleccionar mes</option>
                            <option value="febrero">📅 Febrero</option>
                            <option value="marzo">📅 Marzo</option>
                            <option value="abril">📅 Abril</option>
                            <option value="mayo">📅 Mayo</option>
                            <option value="junio">📅 Junio</option>
                            <option value="julio">📅 Julio</option>
                            <option value="agosto">📅 Agosto</option>
                            <option value="septiembre">📅 Septiembre</option>
                            <option value="octubre">📅 Octubre</option>
                            <option value="noviembre">📅 Noviembre</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-colpay-gray dark:text-gray-300 mb-2">
                            <i class="fas fa-dollar-sign mr-1"></i>Valor del Abono
                        </label>
                        <input type="number" id="valorAbono" name="valorAbono" placeholder="241000" 
                               class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-colpay-blue focus:border-transparent text-base bg-white dark:bg-gray-700 dark:text-white transition-all">
                    </div>
                    
                    <!-- Opción de distribución automática -->
                    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <div class="flex items-center space-x-3">
                            <input type="checkbox" id="distribuirAutomatico" name="distribuirAutomatico" class="w-5 h-5 text-colpay-blue bg-gray-100 border-gray-300 rounded focus:ring-colpay-blue dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                            <div>
                                <label for="distribuirAutomatico" class="text-sm font-medium text-colpay-blue dark:text-blue-300 cursor-pointer">
                                    <i class="fas fa-magic mr-2"></i>Distribución Inteligente
                                </label>
                                <p class="text-xs text-colpay-gray dark:text-gray-400 mt-1">
                                    Distribuye automáticamente desde los meses más antiguos
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <button type="submit" class="w-full bg-gradient-to-r from-colpay-blue to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover-lift">
                    <i class="fas fa-plus-circle mr-2"></i>Registrar Abono
                </button>
            </form>
        </div>

        <!-- Historial Premium -->
        <div class="glass-effect rounded-2xl shadow-xl p-4 hover-lift animate-slide-up">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-bold gradient-text flex items-center">
                    <i class="fas fa-history mr-2"></i>Historial de Abonos
                </h2>
                <button onclick="clearHistory()" class="text-red-500 hover:text-red-600 transition-colors text-sm bg-red-50 dark:bg-red-900 px-3 py-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-800" title="Limpiar TODO el historial" aria-label="Limpiar todo el historial de abonos">
                    <i class="fas fa-trash mr-1" aria-hidden="true"></i>Limpiar Todo
                </button>
            </div>
            
            <div id="historialAbonos" class="space-y-3">
                <!-- Se llenará dinámicamente -->
            </div>
        </div>

        <!-- Simulador Premium -->
        <div class="glass-effect rounded-2xl shadow-xl p-4 hover-lift animate-slide-up">
            <h2 class="text-lg font-bold gradient-text mb-4 flex items-center">
                <i class="fas fa-calculator mr-2"></i>Simulador Inteligente
            </h2>
            
            <div class="space-y-4">
                <div>
                    <h3 class="text-base font-bold text-colpay-gray dark:text-gray-300 mb-3 flex items-center">
                        <i class="fas fa-magic mr-2"></i>¿Qué pasaría si abono...?
                    </h3>
                    <div class="space-y-3">
                        <input type="number" id="simuladorMonto" name="simuladorMonto" placeholder="Monto a simular" 
                               class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-colpay-blue focus:border-transparent text-base bg-white dark:bg-gray-700 dark:text-white transition-all">
                        <button onclick="simularAbono()" class="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium py-3 rounded-xl hover:shadow-lg transition-all hover-lift" title="Simular distribución de abono" aria-label="Simular cómo se distribuiría el abono">
                            <i class="fas fa-crystal-ball mr-2" aria-hidden="true"></i>Simular Escenario
                        </button>
                    </div>
                </div>
                
                <div id="resultadoSimulacion" class="hidden">
                    <h3 class="text-base font-bold text-colpay-gray dark:text-gray-300 mb-3 flex items-center">
                        <i class="fas fa-chart-pie mr-2"></i>Resultado de la Simulación
                    </h3>
                    <div id="detalleSimulacion" class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-3 text-sm border-l-4 border-purple-500">
                        <!-- Resultado de simulación -->
                    </div>
                </div>
            </div>
        </div>

        <!-- Configuración Nuevo Año Premium -->
        <div class="glass-effect rounded-2xl shadow-xl p-4 hover-lift animate-slide-up">
            <h2 class="text-lg font-bold gradient-text mb-4 flex items-center">
                <i class="fas fa-cog mr-2"></i>Configuración Nuevo Año
            </h2>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-colpay-gray dark:text-gray-300 mb-2">
                        <i class="fas fa-money-bill mr-1"></i>Nueva Mensualidad
                    </label>
                    <input type="number" id="nuevaMensualidad" name="nuevaMensualidad" placeholder="241000" 
                           class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-colpay-blue focus:border-transparent text-base bg-white dark:bg-gray-700 dark:text-white transition-all">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-colpay-gray dark:text-gray-300 mb-2">
                        <i class="fas fa-calendar-alt mr-1"></i>Año Escolar
                    </label>
                    <input type="number" id="nuevoAno" name="nuevoAno" placeholder="2025" 
                           class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-colpay-blue focus:border-transparent text-base bg-white dark:bg-gray-700 dark:text-white transition-all">
                </div>
                
                <button onclick="confirmarNuevoAno()" class="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover-lift" title="Iniciar nuevo año escolar" aria-label="Iniciar nuevo año escolar y borrar datos actuales">
                    <i class="fas fa-sync-alt mr-2" aria-hidden="true"></i>Iniciar Nuevo Año Escolar
                </button>
                
                <div class="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900 border border-yellow-200 dark:border-yellow-700 rounded-xl p-3">
                    <p class="text-xs text-yellow-800 dark:text-yellow-300 flex items-start">
                        <i class="fas fa-exclamation-triangle mr-2 mt-0.5 text-yellow-600"></i>
                        <span><strong>Atención:</strong> Esta acción borrará todos los datos actuales y comenzará desde cero con la nueva mensualidad.</span>
                    </p>
                </div>
            </div>
        </div>

        <!-- Footer Premium -->
        <div class="text-center py-6">
            <div class="glass-effect rounded-2xl p-4">
                <div class="flex items-center justify-center space-x-2 mb-2">
                    <div class="w-8 h-8 bg-gradient-to-br from-colpay-blue to-colpay-green rounded-lg flex items-center justify-center" role="img" aria-label="ColPay Pro Footer Logo">
                        <i class="fas fa-graduation-cap text-white" aria-hidden="true"></i>
                    </div>
                    <span class="font-bold gradient-text">ColPay Pro</span>
                </div>
                <p class="text-xs text-colpay-gray dark:text-gray-400">
                    "Paga inteligente, vive tranquilo"
                </p>
                <p class="text-xs text-colpay-gray dark:text-gray-500 mt-2">
                    Desarrollado con ❤️ para padres inteligentes
                </p>
            </div>
        </div>
    </main>

<script>(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'96f473b47314da13',t:'MTc1NTIxNjQ0OC4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();</script></body>
</html>
                function AddStudentModal({onClose, onSave}) {
  const [nombre, setNombre] = useState('');
                const [saldo, setSaldo] = useState('');

  const handleSave = () => {
    if (!nombre || isNaN(Number(saldo))) return;
                onSave({nombre, saldo: Number(saldo) });
  };

                return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2147483647]">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-4">Agregar estudiante</h2>
                        <input
                            type="text"
                            placeholder="Nombre"
                            className="w-full mb-2 p-2 border rounded"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Saldo inicial"
                            className="w-full mb-4 p-2 border rounded"
                            value={saldo}
                            onChange={(e) => setSaldo(e.target.value)}
                        />
                        <div className="flex justify-end space-x-2">
                            <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
                                Cancelar
                            </button>
                            <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleSave}>
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
                );
}
                function EditStudentModal({student, onClose, onSave}) {
  const [nombre, setNombre] = useState(student.nombre);
                const [saldo, setSaldo] = useState(student.saldo);

  const handleSave = () => {
    if (!nombre || isNaN(Number(saldo))) return;
                onSave({...student, nombre, saldo: Number(saldo) });
  };

                return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2147483647]">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-4">Editar estudiante</h2>
                        <input
                            type="text"
                            className="w-full mb-2 p-2 border rounded"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                        <input
                            type="number"
                            className="w-full mb-4 p-2 border rounded"
                            value={saldo}
                            onChange={(e) => setSaldo(e.target.value)}
                        />
                        <div className="flex justify-end space-x-2">
                            <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
                                Cancelar
                            </button>
                            <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={handleSave}>
                                Guardar cambios
                            </button>
                        </div>
                    </div>
                </div>
                );
}
                'use client';
                import React, {useState} from 'react';

                // 🧱 Modal para agregar estudiante
                function AddStudentModal({onClose, onSave}) {
  const [nombre, setNombre] = useState('');
                const [saldo, setSaldo] = useState('');

  const handleSave = () => {
    if (!nombre || isNaN(Number(saldo))) return;
                onSave({nombre, saldo: Number(saldo) });
  };

                return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2147483647]">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-4">Agregar estudiante</h2>
                        <input
                            type="text"
                            placeholder="Nombre"
                            className="w-full mb-2 p-2 border rounded"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Saldo inicial"
                            className="w-full mb-4 p-2 border rounded"
                            value={saldo}
                            onChange={(e) => setSaldo(e.target.value)}
                        />
                        <div className="flex justify-end space-x-2">
                            <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
                                Cancelar
                            </button>
                            <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleSave}>
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
                );
}

                // 🧱 Modal para editar estudiante
                function EditStudentModal({student, onClose, onSave}) {
  const [nombre, setNombre] = useState(student.nombre);
                const [saldo, setSaldo] = useState(student.saldo);

  const handleSave = () => {
    if (!nombre || isNaN(Number(saldo))) return;
                onSave({...student, nombre, saldo: Number(saldo) });
  };

                return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2147483647]">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-4">Editar estudiante</h2>
                        <input
                            type="text"
                            className="w-full mb-2 p-2 border rounded"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                        <input
                            type="number"
                            className="w-full mb-4 p-2 border rounded"
                            value={saldo}
                            onChange={(e) => setSaldo(e.target.value)}
                        />
                        <div className="flex justify-end space-x-2">
                            <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
                                Cancelar
                            </button>
                            <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={handleSave}>
                                Guardar cambios
                            </button>
                        </div>
                    </div>
                </div>
                );
}

                // 🧩 Componente principal
                export default function CalculadoraPage() {
  const [students, setStudents] = useState([]);
                const [showAddModal, setShowAddModal] = useState(false);
                const [showEditModal, setShowEditModal] = useState(false);
                const [currentStudent, setCurrentStudent] = useState(null);

                return (
                <div className="min-h-screen bg-gray-100 p-4">
                    <h1 className="text-2xl font-bold mb-4">Calculadora Escolar</h1>

                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={() => setShowAddModal(true)}
                    >
                        + Agregar estudiante
                    </button>

                    <div className="mt-6 space-y-4">
                        {students.map((student, index) => (
                            <div key={index} className="bg-white p-4 rounded shadow flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{student.nombre}</p>
                                    <p>Saldo: ${student.saldo}</p>
                                </div>
                                <div className="space-x-2">
                                    <button
                                        className="text-yellow-500"
                                        onClick={() => {
                                            setCurrentStudent(student);
                                            setShowEditModal(true);
                                        }}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="text-red-500"
                                        onClick={() => {
                                            const updated = [...students];
                                            updated.splice(index, 1);
                                            setStudents(updated);
                                        }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {showAddModal && (
                        <AddStudentModal
                            onClose={() => setShowAddModal(false)}
                            onSave={(newStudent) => {
                                setStudents([...students, newStudent]);
                                setShowAddModal(false);
                            }}
                        />
                    )}

                    {showEditModal && currentStudent && (
                        { showDetailModal && currentStudent && (
                            <StudentDetailModal
                                student={currentStudent}
                                onClose={() => setShowDetailModal(false)}
                            />
                        )}
                          
                        <EditStudentModal
                            student={currentStudent}
                            onClose={() => setShowEditModal(false)}
                            onSave={(updatedStudent) => {
                                const updated = students.map((s) =>
                                    s.nombre === updatedStudent.nombre ? updatedStudent : s
                                );
                                setStudents(updated);
                                setShowEditModal(false);
                            }}
                        />
                    )}
                    <ConfiguracionPanel onReset={(data) => {
                        console.log('Nuevo año escolar:', data);
                    }} />

                </div>
                );
}
function ConfiguracionPanel({ onReset }) {
  const [mensualidad, setMensualidad] = useState(241000);
  const [añoEscolar, setAñoEscolar] = useState(2025);
  const [simulacion, setSimulacion] = useState('');
  const [resultado, setResultado] = useState('');

  const simularEscenario = () => {
    const monto = Number(simulacion);
    if (isNaN(monto) || monto <= 0) return;
    const mesesCubiertos = Math.floor(monto / mensualidad);
    const restante = monto % mensualidad;
    setResultado(`Ese monto cubriría ${mesesCubiertos} mes(es) completos y sobrarían $${restante}.`);
  };

  const iniciarNuevoAño = () => {
    if (confirm('¿Estás seguro? Esta acción borrará todos los datos actuales.')) {
      onReset({ mensualidad, añoEscolar });
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Configuración Año Escolar</h2>

      <label className="block mb-2 font-semibold">Nueva Mensualidad</label>
      <input
        type="number"
        className="w-full mb-4 p-2 border rounded"
        value={mensualidad}
        onChange={(e) => setMensualidad(Number(e.target.value))}
      />

      <label className="block mb-2 font-semibold">Año Escolar</label>
      <input
        type="number"
        className="w-full mb-4 p-2 border rounded"
        value={añoEscolar}
        onChange={(e) => setAñoEscolar(Number(e.target.value))}
      />

      <button
        className="w-full bg-red-500 text-white py-2 rounded mb-6"
        onClick={iniciarNuevoAño}
      >
        Iniciar Nuevo Año Escolar
      </button>

      <h3 className="text-lg font-bold mb-2">Simulador de Escenario</h3>
      <input
        type="number"
        placeholder="¿Qué pasaría si abono...?"
        className="w-full mb-2 p-2 border rounded"
        value={simulacion}
        onChange={(e) => setSimulacion(e.target.value)}
      />
      <button
        className="w-full bg-blue-500 text-white py-2 rounded mb-2"
        onClick={simularEscenario}
      >
        Simular Escenario
      </button>
      {resultado && <p className="text-green-700 font-medium mt-2">{resultado}</p>}

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Desarrollado con ❤️ para padres inteligentes</p>
        <p className="mt-1 italic">ColPay Pro · Origen26</p>
      </div>
    </div>
  );
}
} // ← Esta es la llave final de CalculadoraPage

                // 🔽 Pega aquí el componente ConfiguracionPanel
                function ConfiguracionPanel({onReset}) {
                    // ... (todo el bloque que te di)
                }
} // ← Esta es la última llave de CalculadoraPage

                // 🔽 Pega aquí el componente StudentDetailModal
                function StudentDetailModal({student, onClose}) {
                    // ... (todo el bloque que te di)
                }
