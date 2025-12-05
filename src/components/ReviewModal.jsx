import React, { useState, useEffect } from 'react';
import supabase from '../config/supabaseClient';
import validarAyudantia from '../services/ValidateService';

const ReviewModal = ({ isOpen, onClose, courseId }) => {
    const [step, setStep] = useState(1);
    const [taTypes, setTaTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState(null);
    const [course, setCourse] = useState(null);
    const [validating, setValidating] = useState(false);
    const [validationResult, setValidationResult] = useState(null);
    
    // Form data
    const [formData, setFormData] = useState({
        semester: '',
        taTypeId: '',
        customTaType: '',
        professor: '',
        salaryRange: '',
        monthHours: '',
        monthHoursCustom: '',
        useCustomHours: false,
        showNewTaTypeInput: false,
        anonymous: false,
        rating: 0,
        title: '',
        description: '',
        validationFile: null
    });

    const [validationErrors, setValidationErrors] = useState({});

    const totalSteps = 5;

    useEffect(() => {
        const fetchCourse = async () => {
            if (courseId) {
                try {
                    const { data, error } = await supabase
                        .from('Courses')
                        .select('id, name, initial')
                        .eq('id', courseId)
                        .single();
                    
                    if (error) {
                        console.error('Error fetching course:', error);
                    } else {
                        setCourse(data);
                    }
                } catch (err) {
                    console.error('Error:', err);
                }
            }
        };

        if (isOpen && courseId) {
            fetchCourse();
            // Get current user
            const getUser = async () => {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);
            };
            getUser();

            // Fetch TA types
            fetchTaTypes();
        } else {
            // Reset cuando se cierra el modal
            setStep(1);
            setValidationErrors({});
            setFormData({
                semester: '',
                taTypeId: '',
                customTaType: '',
                professor: '',
                salaryRange: '',
                monthHours: '',
                monthHoursCustom: '',
                useCustomHours: false,
                showNewTaTypeInput: false,
                anonymous: false,
                rating: 0,
                title: '',
                description: '',
                validationFile: null
            });
        }
    }, [isOpen, courseId]);

    const fetchTaTypes = async () => {
        try {
            // Try with the exact table name as defined in the schema (with quotes)
            const { data, error } = await supabase
                .from('TaTypes')
                .select('id, name')
                .order('name');
            
            if (error) {
                console.error('Error fetching TA types:', error);
                console.error('Error details:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                // Try alternative table name without quotes
                const { data: altData, error: altError } = await supabase
                    .from('tatypes')
                    .select('id, name')
                    .order('name');
                
                if (altError) {
                    console.error('Alternative fetch also failed:', altError);
                    throw error; // Throw original error
                }
                
                console.log('TaTypes fetched (alternative):', altData);
                setTaTypes(altData || []);
                return;
            }
            
            console.log('TaTypes fetched:', data);
            setTaTypes(data || []);
        } catch (error) {
            console.error('Error fetching TA types:', error);
            // Set empty array on error to prevent UI issues
            setTaTypes([]);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear validation error for this field when user starts typing
        if (validationErrors[field]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateStep = (stepNumber) => {
        const errors = {};
        
        switch (stepNumber) {
            case 1:
                if (!formData.semester) {
                    errors.semester = 'Debes seleccionar un semestre';
                }
                if (!formData.taTypeId) {
                    errors.taTypeId = 'Debes seleccionar un tipo de cargo';
                }
                if (formData.showNewTaTypeInput && !formData.customTaType.trim()) {
                    errors.customTaType = 'Debes ingresar el nombre del nuevo tipo de cargo';
                }
                break;
            case 2:
                if (!formData.salaryRange) {
                    errors.salaryRange = 'Debes seleccionar un rango de salario';
                }
                if (!formData.useCustomHours && !formData.monthHours) {
                    errors.monthHours = 'Debes seleccionar las horas mensuales';
                }
                if (formData.useCustomHours && !formData.monthHoursCustom) {
                    errors.monthHoursCustom = 'Debes ingresar la cantidad de horas mensuales';
                }
                break;
            case 3:
                // No validation needed for privacy step
                break;
            case 4:
                if (!formData.rating || formData.rating === 0) {
                    errors.rating = 'Debes seleccionar una calificación';
                }
                if (!formData.title.trim()) {
                    errors.title = 'Debes ingresar un título';
                }
                if (!formData.description.trim()) {
                    errors.description = 'Debes ingresar una descripción';
                }
                break;
            case 5:
                // No validation needed for validation file step (optional)
                break;
            default:
                break;
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            if (step < totalSteps) {
                setStep(step + 1);
            }
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleSubmit = async () => {
        if (!user) {
            alert('Debes iniciar sesión para publicar una reseña');
            return;
        }

        // Si hay archivo de validación, validarlo primero
        if (formData.validationFile && course) {
            setValidating(true);
            setValidationResult(null);
            
            try {
                // Obtener la sigla del curso para la validación
                const cursoSigla = course.initial || course.name;
                const resultado = await validarAyudantia(formData.validationFile, cursoSigla);
                
                setValidationResult(resultado);
                
                if (!resultado.validado) {
                    const continuar = confirm(
                        'El documento no pudo validar tu experiencia como ayudante de este curso. ' +
                        '¿Deseas continuar y publicar la reseña sin validación?'
                    );
                    if (!continuar) {
                        setValidating(false);
                        return;
                    }
                }
            } catch (error) {
                console.error('Error en validación:', error);
                const continuar = confirm(
                    'Hubo un error al validar el documento. ' +
                    '¿Deseas continuar y publicar la reseña sin validación?'
                );
                if (!continuar) {
                    setValidating(false);
                    return;
                }
            } finally {
                setValidating(false);
            }
        }

        setSubmitting(true);
        try {
            let finalTaTypeId = formData.taTypeId;

            // If custom TA type, create it first
            if (formData.showNewTaTypeInput && formData.customTaType.trim()) {
                const { data: newTaType, error: createError } = await supabase
                    .from('TaTypes')
                    .insert([{ name: formData.customTaType.trim() }])
                    .select()
                    .single();

                if (createError) throw createError;
                finalTaTypeId = newTaType.id;
            }

            // Parse month hours
            let finalMonthHours = null;
            if (formData.useCustomHours) {
                finalMonthHours = parseInt(formData.monthHoursCustom) || null;
            } else if (formData.monthHours) {
                // Parse range like "5-10" to get average or first value
                if (formData.monthHours.includes('-')) {
                    const [min, max] = formData.monthHours.split('-').map(Number);
                    finalMonthHours = Math.floor((min + max) / 2);
                } else {
                    finalMonthHours = parseInt(formData.monthHours);
                }
            }

            // Parse salary range
            let minSalary = null;
            let maxSalary = null;
            if (formData.salaryRange) {
                if (formData.salaryRange === '300000-plus') {
                    minSalary = 300000;
                    maxSalary = null; // No max for "300k or more"
                } else if (formData.salaryRange.includes('-')) {
                    const [min, max] = formData.salaryRange.split('-').map(val => {
                        // Remove dots from formatted numbers like "10.000"
                        return parseInt(val.replace(/\./g, ''));
                    });
                    minSalary = min;
                    maxSalary = max;
                }
            }

            // Prepare review data
            // validated is always false regardless of whether a file is uploaded
            // professor: save trimmed value or NULL if empty
            const professorValue = formData.professor.trim() || null;
            
            const reviewData = {
                course_id: courseId,
                user_id: formData.anonymous ? null : user.id,
                semester: formData.semester,
                ta_type_id: finalTaTypeId,
                professor: professorValue,
                min_salary: minSalary,
                max_salary: maxSalary,
                month_hours: finalMonthHours,
                rating: formData.rating,
                title: formData.title,
                description: formData.description,
                anonymous: formData.anonymous,
                validated: validationResult.validado
            };

            const { error: insertError } = await supabase
                .from('Reviews')
                .insert([reviewData]);

            if (insertError) throw insertError;

            alert('¡Reseña publicada exitosamente!');
            onClose();
            // Reset form
            setStep(1);
            setValidationErrors({});
            setFormData({
                semester: '',
                taTypeId: '',
                customTaType: '',
                professor: '',
                salaryRange: '',
                monthHours: '',
                monthHoursCustom: '',
                useCustomHours: false,
                showNewTaTypeInput: false,
                anonymous: false,
                rating: 0,
                title: '',
                description: '',
                validationFile: null
            });
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Error al publicar la reseña: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    // Generate semester options from 2018-1 to 2025-2 (inclusive)
    // 
    // LÓGICA DE GENERACIÓN DE SEMESTRES:
    // 1. Partimos desde un año inicial (2018) y semestre inicial (1)
    // 2. Generamos semestres en orden: 2018-1, 2018-2, 2019-1, 2019-2, etc.
    // 3. La secuencia es: año-semestre1, año-semestre2, (año+1)-semestre1, (año+1)-semestre2...
    // 4. Nos detenemos cuando llegamos a 2025-2 (el último semestre permitido)
    //
    // Ejemplo de secuencia generada:
    // 2018-1 → 2018-2 → 2019-1 → 2019-2 → ... → 2025-1 → 2025-2 (STOP)
    
    const semesterOptions = [];
    
    // Inicializamos desde 2018-1
    let year = 2018;
    let semester = 1;
    
    // Generamos todos los semestres hasta llegar a 2025-2
    while (true) {
        // Agregamos el semestre actual al array
        const semesterStr = `${year}-${semester}`;
        semesterOptions.push(semesterStr);
        
        // Si llegamos a 2025-2, detenemos la generación
        if (year === 2025 && semester === 2) {
            break;
        }
        
        // Avanzamos al siguiente semestre
        // Si estamos en semestre 1, pasamos a semestre 2 del mismo año
        // Si estamos en semestre 2, pasamos a semestre 1 del año siguiente
        if (semester === 1) {
            semester = 2;  // Mismo año, siguiente semestre
        } else {
            semester = 1;  // Nuevo año, primer semestre
            year++;
        }
        
        // Protección contra loops infinitos (por si acaso)
        if (year > 2025) {
            break;
        }
    }
    
    // Invertir el array para mostrar los semestres más recientes primero (2025-2 al inicio, 2018-1 al final)
    const semesterOptionsReversed = [...semesterOptions].reverse();
    
    console.log('Semester options generated:', semesterOptions);
    console.log('Semester options reversed (most recent first):', semesterOptionsReversed);

    // Salary range options: 0-10k, 10k-20k, ..., 290k-300k, 300k+
    const salaryRangeOptions = [];
    for (let i = 0; i < 30; i++) {
        const min = i * 10000;
        const max = (i + 1) * 10000;
        salaryRangeOptions.push({
            value: `${min}-${max}`,
            label: `$${min.toLocaleString('es-CL')} - $${max.toLocaleString('es-CL')}`
        });
    }
    salaryRangeOptions.push({
        value: '300000-plus',
        label: '$300.000 o más'
    });

    // Month hours options with 5-hour ranges up to 100 hours
    const monthHoursOptions = [];
    for (let i = 0; i < 100; i += 5) {
        const min = i;
        const max = i + 5;
        monthHoursOptions.push({
            value: `${min}-${max}`,
            label: `${min} - ${max} horas`
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-blue-950 border-2 border-blue-400/30 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        Publicar Reseña - Paso {step} de {totalSteps}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Progress bar */}
                <div className="mb-6">
                    <div className="w-full bg-blue-900/50 rounded-full h-2">
                        <div
                            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(step / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Step 1: Basic Info */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-white mb-2">Semestre</label>
                            <select
                                value={formData.semester}
                                onChange={(e) => handleInputChange('semester', e.target.value)}
                                className="w-full px-4 py-2 bg-blue-900/50 border border-blue-400/30 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                            >
                                <option value="">Selecciona un semestre</option>
                                {semesterOptionsReversed.map(sem => (
                                    <option key={sem} value={sem}>{sem}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-white mb-2">Tipo de Cargo</label>
                            <div className="flex gap-2">
                                <select
                                    value={formData.taTypeId}
                                    onChange={(e) => {
                                        handleInputChange('taTypeId', e.target.value);
                                        handleInputChange('showNewTaTypeInput', false);
                                    }}
                                    className="flex-1 px-4 py-2 bg-blue-900/50 border border-blue-400/30 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                                >
                                    <option value="">Selecciona un tipo</option>
                                    {taTypes.length > 0 ? (
                                        taTypes.map(type => (
                                            <option key={type.id} value={type.id}>{type.name}</option>
                                        ))
                                    ) : (
                                        <option value="" disabled>No hay tipos disponibles</option>
                                    )}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleInputChange('showNewTaTypeInput', !formData.showNewTaTypeInput);
                                        if (!formData.showNewTaTypeInput) {
                                            handleInputChange('taTypeId', 'custom');
                                        }
                                    }}
                                    className="px-4 py-2 bg-yellow-400 text-blue-950 font-semibold rounded-lg hover:bg-yellow-500 transition-colors whitespace-nowrap"
                                >
                                    {formData.showNewTaTypeInput ? 'Cancelar' : 'Nuevo Cargo'}
                                </button>
                            </div>
                        </div>

                        {formData.showNewTaTypeInput && (
                            <div>
                                <label className="block text-white mb-2">Nombre del nuevo tipo de cargo</label>
                                <input
                                    type="text"
                                    value={formData.customTaType}
                                    onChange={(e) => handleInputChange('customTaType', e.target.value)}
                                    placeholder="Ej: Ayudante Coordinador"
                                    className="w-full px-4 py-2 bg-blue-900/50 border border-blue-400/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-white mb-2">Profesor Encargado (Opcional)</label>
                            <input
                                type="text"
                                value={formData.professor}
                                onChange={(e) => handleInputChange('professor', e.target.value)}
                                placeholder="Nombre del profesor"
                                className="w-full px-4 py-2 bg-blue-900/50 border border-blue-400/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
                            />
                        </div>
                        {validationErrors.semester && (
                            <p className="text-red-400 text-sm">{validationErrors.semester}</p>
                        )}
                        {validationErrors.taTypeId && (
                            <p className="text-red-400 text-sm">{validationErrors.taTypeId}</p>
                        )}
                        {validationErrors.customTaType && (
                            <p className="text-red-400 text-sm">{validationErrors.customTaType}</p>
                        )}
                    </div>
                )}

                {/* Step 2: Salary and Hours */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-white mb-2">Rango de Salario Mensual (CLP)</label>
                            <select
                                value={formData.salaryRange}
                                onChange={(e) => handleInputChange('salaryRange', e.target.value)}
                                className={`w-full px-4 py-2 bg-blue-900/50 border rounded-lg text-white focus:outline-none focus:border-yellow-400 ${
                                    validationErrors.salaryRange ? 'border-red-400' : 'border-blue-400/30'
                                }`}
                            >
                                <option value="">Selecciona un rango de salario</option>
                                {salaryRangeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {validationErrors.salaryRange && (
                                <p className="text-red-400 text-sm mt-1">{validationErrors.salaryRange}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-white mb-2">Horas Mensuales Estimadas</label>
                            <div className="flex gap-2">
                                <select
                                    value={formData.monthHours}
                                    onChange={(e) => {
                                        handleInputChange('monthHours', e.target.value);
                                        handleInputChange('useCustomHours', false);
                                    }}
                                    disabled={formData.useCustomHours}
                                    className={`flex-1 px-4 py-2 bg-blue-900/50 border rounded-lg text-white focus:outline-none focus:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed ${
                                        validationErrors.monthHours ? 'border-red-400' : 'border-blue-400/30'
                                    }`}
                                >
                                    <option value="">Selecciona horas mensuales</option>
                                    {monthHoursOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleInputChange('useCustomHours', !formData.useCustomHours);
                                        if (!formData.useCustomHours) {
                                            handleInputChange('monthHours', '');
                                        }
                                    }}
                                    className={`px-4 py-2 font-semibold rounded-lg transition-colors whitespace-nowrap ${
                                        formData.useCustomHours
                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                            : 'bg-yellow-400 text-blue-950 hover:bg-yellow-500'
                                    }`}
                                >
                                    {formData.useCustomHours ? 'Cancelar' : 'Personalizado'}
                                </button>
                            </div>
                            {validationErrors.monthHours && (
                                <p className="text-red-400 text-sm mt-1">{validationErrors.monthHours}</p>
                            )}
                        </div>

                        {formData.useCustomHours && (
                            <div>
                                <label className="block text-white mb-2">Horas mensuales (número)</label>
                                <input
                                    type="number"
                                    value={formData.monthHoursCustom}
                                    onChange={(e) => handleInputChange('monthHoursCustom', e.target.value)}
                                    placeholder="Ej: 25"
                                    min="0"
                                    className={`w-full px-4 py-2 bg-blue-900/50 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 ${
                                        validationErrors.monthHoursCustom ? 'border-red-400' : 'border-blue-400/30'
                                    }`}
                                />
                                {validationErrors.monthHoursCustom && (
                                    <p className="text-red-400 text-sm mt-1">{validationErrors.monthHoursCustom}</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Privacy */}
                {step === 3 && (
                    <div className="space-y-4">
                        <div className="bg-blue-900/30 rounded-lg p-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.anonymous}
                                    onChange={(e) => handleInputChange('anonymous', e.target.checked)}
                                    className="w-5 h-5 text-yellow-400 rounded focus:ring-yellow-400"
                                />
                                <span className="text-white">Publicar reseña de forma anónima</span>
                            </label>
                            <p className="text-white/70 text-sm mt-2 ml-8">
                                Si seleccionas esta opción, tu nombre no aparecerá en la reseña.
                            </p>
                        </div>
                    </div>
                )}

                {/* Step 4: Rating and Review */}
                {step === 4 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-white mb-2">Calificación General</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => handleInputChange('rating', star)}
                                        className="text-4xl focus:outline-none transition-transform hover:scale-110"
                                    >
                                        {star <= formData.rating ? (
                                            <span className="text-yellow-400">★</span>
                                        ) : (
                                            <span className="text-white/30">★</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                            {formData.rating > 0 && (
                                <p className="text-white/70 text-sm mt-2">
                                    {formData.rating} de 5 estrellas
                                </p>
                            )}
                            {validationErrors.rating && (
                                <p className="text-red-400 text-sm mt-1">{validationErrors.rating}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-white mb-2">Título de la Reseña</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="Ej: Excelente experiencia como ayudante"
                                className={`w-full px-4 py-2 bg-blue-900/50 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 ${
                                    validationErrors.title ? 'border-red-400' : 'border-blue-400/30'
                                }`}
                            />
                            {validationErrors.title && (
                                <p className="text-red-400 text-sm mt-1">{validationErrors.title}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-white mb-2">Descripción de tu Experiencia</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Comparte tu experiencia como ayudante..."
                                rows="6"
                                className={`w-full px-4 py-2 bg-blue-900/50 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 resize-none ${
                                    validationErrors.description ? 'border-red-400' : 'border-blue-400/30'
                                }`}
                            />
                            {validationErrors.description && (
                                <p className="text-red-400 text-sm mt-1">{validationErrors.description}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 5: Validation File */}
                {step === 5 && (
                    <div className="space-y-4">
                        <div className="bg-blue-900/30 rounded-lg p-4">
                            <h3 className="text-white font-semibold mb-2">Validación de Reseña</h3>
                            <p className="text-white/70 text-sm mb-4">
                                Puedes subir un archivo PDF como evidencia de tu experiencia como ayudante. Este paso es opcional por ahora.
                            </p>
                            <div>
                                <label className="block text-white mb-2">Archivo de Validación (PDF)</label>
                                <input
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                                                handleInputChange('validationFile', file);
                                            } else {
                                                alert('Por favor selecciona un archivo PDF');
                                                e.target.value = '';
                                            }
                                        }
                                    }}
                                    className="w-full px-4 py-2 bg-blue-900/50 border border-blue-400/30 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-blue-950 hover:file:bg-yellow-500 file:cursor-pointer"
                                />
                                {formData.validationFile && (
                                    <p className="text-white/70 text-sm mt-2">
                                        Archivo seleccionado: {formData.validationFile.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                    <button
                        onClick={step === 1 ? onClose : handleBack}
                        className="px-6 py-2 bg-transparent border-2 border-blue-400 text-white rounded-lg hover:bg-blue-400/20 transition-colors"
                    >
                        {step === 1 ? 'Cancelar' : 'Atrás'}
                    </button>
                    {step < totalSteps ? (
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 bg-yellow-400 text-blue-950 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
                        >
                            Siguiente
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-6 py-2 bg-yellow-400 text-blue-950 font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Publicando...' : 'Publicar Reseña'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
