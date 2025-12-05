import React, { useState, useEffect } from 'react';
import supabase from '../config/supabaseClient';

const EditReviewModal = ({ isOpen, onClose, review, onUpdate }) => {
    const [step, setStep] = useState(1);
    const [taTypes, setTaTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState(null);

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

    // Convert review data to form format
    const convertReviewToFormData = (review) => {
        if (!review) return;

        // Convert salary range
        let salaryRange = '';
        if (review.min_salary !== null && review.max_salary !== null) {
            if (review.min_salary >= 300000 && review.max_salary === null) {
                salaryRange = '300000-plus';
            } else {
                salaryRange = `${review.min_salary}-${review.max_salary}`;
            }
        }

        // Convert month hours
        let monthHours = '';
        let useCustomHours = false;
        let monthHoursCustom = '';
        if (review.month_hours !== null) {
            // Check if it matches a standard range
            const hours = review.month_hours;
            const foundRange = monthHoursOptions.find(opt => {
                const [min, max] = opt.value.split('-').map(Number);
                return hours >= min && hours < max;
            });
            if (foundRange) {
                monthHours = foundRange.value;
            } else {
                useCustomHours = true;
                monthHoursCustom = hours.toString();
            }
        }

        setFormData({
            semester: review.semester || '',
            taTypeId: review.ta_type_id?.toString() || '',
            customTaType: '',
            professor: review.professor || '',
            salaryRange: salaryRange,
            monthHours: monthHours,
            monthHoursCustom: monthHoursCustom,
            useCustomHours: useCustomHours,
            showNewTaTypeInput: false,
            anonymous: review.anonymous || false,
            rating: review.rating || 0,
            title: review.title || '',
            description: review.description || '',
            validationFile: null
        });
    };

    useEffect(() => {
        if (isOpen && review) {
            // Get current user
            const getUser = async () => {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);
            };
            getUser();

            // Fetch TA types
            fetchTaTypes();

            // Convert review data to form format
            convertReviewToFormData(review);
        } else {
            // Reset cuando se cierra el modal
            setStep(1);
            setValidationErrors({});
        }
    }, [isOpen, review]);

    const fetchTaTypes = async () => {
        try {
            const { data, error } = await supabase
                .from('TaTypes')
                .select('id, name')
                .order('name');

            if (error) {
                console.error('Error fetching TA types:', error);
                const { data: altData, error: altError } = await supabase
                    .from('tatypes')
                    .select('id, name')
                    .order('name');

                if (altError) {
                    console.error('Alternative fetch also failed:', altError);
                    setTaTypes([]);
                    return;
                }

                setTaTypes(altData || []);
                return;
            }

            setTaTypes(data || []);
        } catch (error) {
            console.error('Error fetching TA types:', error);
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
            alert('Debes iniciar sesión para editar una reseña');
            return;
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
                    maxSalary = null;
                } else if (formData.salaryRange.includes('-')) {
                    const [min, max] = formData.salaryRange.split('-').map(val => {
                        return parseInt(val.replace(/\./g, ''));
                    });
                    minSalary = min;
                    maxSalary = max;
                }
            }

            const professorValue = formData.professor.trim() || null;

            // Get user display name from metadata if not anonymous
            const authorName = formData.anonymous 
                ? null 
                : (user?.user_metadata?.display_name || 
                   user?.user_metadata?.full_name || 
                   user?.email?.split('@')[0] || 
                   null);

            const reviewData = {
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
                validated: false,
                author_name: authorName
            };

            const { error: updateError } = await supabase
                .from('Reviews')
                .update(reviewData)
                .eq('id', review.id);

            if (updateError) throw updateError;

            // alert('¡Reseña actualizada exitosamente!');
            onUpdate(); // Refresh the review data
            onClose();
        } catch (error) {
            console.error('Error updating review:', error);
            alert('Error al actualizar la reseña: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    // Generate semester options (same as ReviewModal)
    const semesterOptions = [];
    let year = 2018;
    let semester = 1;

    while (true) {
        const semesterStr = `${year}-${semester}`;
        semesterOptions.push(semesterStr);

        if (year === 2025 && semester === 2) {
            break;
        }

        if (semester === 1) {
            semester = 2;
        } else {
            semester = 1;
            year++;
        }

        if (year > 2025) {
            break;
        }
    }

    const semesterOptionsReversed = [...semesterOptions].reverse();

    // Salary range options
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

    // Month hours options
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
                        Editar Reseña - Paso {step} de {totalSteps}
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
                                className={`w-full px-4 py-2 bg-blue-900/50 border rounded-lg text-white focus:outline-none focus:border-yellow-400 ${validationErrors.salaryRange ? 'border-red-400' : 'border-blue-400/30'
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
                                    className={`flex-1 px-4 py-2 bg-blue-900/50 border rounded-lg text-white focus:outline-none focus:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed ${validationErrors.monthHours ? 'border-red-400' : 'border-blue-400/30'
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
                                    className={`px-4 py-2 font-semibold rounded-lg transition-colors whitespace-nowrap ${formData.useCustomHours
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
                                    className={`w-full px-4 py-2 bg-blue-900/50 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 ${validationErrors.monthHoursCustom ? 'border-red-400' : 'border-blue-400/30'
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
                                className={`w-full px-4 py-2 bg-blue-900/50 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 ${validationErrors.title ? 'border-red-400' : 'border-blue-400/30'
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
                                className={`w-full px-4 py-2 bg-blue-900/50 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 resize-none ${validationErrors.description ? 'border-red-400' : 'border-blue-400/30'
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
                            {submitting ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditReviewModal;