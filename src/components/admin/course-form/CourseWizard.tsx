'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCourseSchema, CreateCourse } from '@/lib/schemas/course';
import { useRouter } from 'next/navigation';
import { useCreateCourse, useUpdateCourse } from '@/hooks/use-courses';
import { useToast } from '@/components/ui/toast';
import { Loader2, Check, ChevronRight, ChevronLeft, Save } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion'; // Removed for persistence strategy

// Steps
import { StepBasicInfo } from './StepBasicInfo';
import { StepDelivery } from './StepDelivery';
import { StepCurriculum } from './StepCurriculum';
import { StepInstructors } from './StepInstructors';
import { StepOutcomes } from './StepOutcomes';
import { StepDeliverables } from './StepDeliverables';
import { StepSchedule } from './StepSchedule';

interface CourseWizardProps {
    initialData?: Partial<CreateCourse>;
    mode: 'create' | 'edit';
}

const STEPS = [
    { id: 'basic', title: 'Basic Info', description: 'Name, Category, Level', component: StepBasicInfo },
    { id: 'delivery', title: 'Delivery & Duration', description: 'Online/Offline, Hours', component: StepDelivery },
    { id: 'curriculum', title: 'Curriculum', description: 'Modules & Chapters', component: StepCurriculum },
    { id: 'outcomes', title: 'Outcomes', description: 'What students learn', component: StepOutcomes },
    { id: 'deliverables', title: 'Deliverables', description: 'Projects & Assignments', component: StepDeliverables },
    { id: 'instructors', title: 'Instructors', description: 'Assign Trainers', component: StepInstructors },
    { id: 'schedule', title: 'Schedule', description: 'Batches & Timing', component: StepSchedule },
];

// Helper to deeply sanitize data (remove nulls) so Zod/ReactHookForm don't complain about "expected string, received null"
const deepSanitize = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(deepSanitize);
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const value = obj[key];
            // Recursively sanitize
            acc[key] = deepSanitize(value);
            // Specific fix for fields that might be null but schema expects string/undefined
            if (acc[key] === null) {
                if (['photoUrl', 'videoUrl', 'shortDescription', 'category', 'linkedinUrl', 'bio', 'title'].includes(key)) {
                    acc[key] = ''; // Convert specific nulls to empty string
                } else {
                    acc[key] = undefined; // Convert other nulls to undefined
                }
            }
            return acc;
        }, {} as any);
    }
    return obj;
};

export function CourseWizard({ initialData, mode }: CourseWizardProps) {
    const router = useRouter();
    const { addToast } = useToast();
    const [currentStep, setCurrentStep] = useState(0);

    const createMutation = useCreateCourse();
    const updateMutation = useUpdateCourse();

    const isPending = createMutation.isPending || updateMutation.isPending;

    // Sanitize initialData BEFORE passing to useForm to prevent initial Zod errors
    const sanitizedInitialData = deepSanitize(initialData || {});

    const methods = useForm<CreateCourse>({
        resolver: zodResolver(CreateCourseSchema),
        defaultValues: {
            name: sanitizedInitialData.name || 'Untitled Course',
            status: sanitizedInitialData.status || 'DRAFT',
            domain: sanitizedInitialData.domain || 'IT',
            industry: sanitizedInitialData.industry || 'Generic',
            category: sanitizedInitialData.category || 'Software Development',
            targetLevel: sanitizedInitialData.targetLevel || 'Beginner', // CRITICAL: Ensure default
            learningObjectives: sanitizedInitialData.learningObjectives || [],
            curriculum: sanitizedInitialData.curriculum || [],
            instructors: (sanitizedInitialData.instructors || []).map((inst: any) => ({
                ...inst,
                name: (inst.name && inst.name.length >= 2) ? inst.name : 'Unknown Instructor'
            })),
            deliverables: sanitizedInitialData.deliverables || [],
            includedFeatures: sanitizedInitialData.includedFeatures || [],
            deliveryMode: sanitizedInitialData.deliveryMode || ['Live Online'] as any,
            courseType: sanitizedInitialData.courseType || 'Technology',
            durationHours: sanitizedInitialData.durationHours || 40,
            price: (typeof sanitizedInitialData.price === 'number' && !isNaN(sanitizedInitialData.price)) ? sanitizedInitialData.price : 0,
            description: sanitizedInitialData.description || ''
        },
        mode: 'onSubmit',
        reValidateMode: 'onChange',
        shouldUnregister: false, // CRITICAL: Retain data when steps unmount
    });

    const { handleSubmit, trigger, getValues, formState: { isValid }, reset } = methods;

    // Synchronize form with initialData (e.g. from AI Generator)
    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            console.log("🔄 [Wizard] Populating with data (raw):", initialData);

            const sanitizedData = deepSanitize(initialData);
            console.log("✨ [Wizard] Populating with sanitized data:", sanitizedData);

            reset({
                ...methods.getValues(),
                ...sanitizedData,
                // Ensure array fields are initialized correctly
                instructors: sanitizedData.instructors || [],
                learningObjectives: sanitizedData.learningObjectives || [],
                curriculum: sanitizedData.curriculum || [],
                deliverables: sanitizedData.deliverables || []
            });
        }
    }, [initialData, reset]);

    // DEBUG: Log form state on step change to verify retention
    /*
    useEffect(() => {
        console.log(`🔍 [Wizard] Current Form Data (Step ${currentStep}):`, getValues());
    }, [currentStep, getValues]); 
    */

    const STEP_FIELDS: (keyof CreateCourse)[][] = [
        ['name', 'category', 'domain', 'courseType', 'industry', 'targetLevel', 'description'], // Basic Info
        ['deliveryMode', 'durationHours'], // Delivery
        ['curriculum'], // Curriculum
        ['learningObjectives'], // Outcomes
        ['deliverables'], // Deliverables
        ['instructors'], // Instructors
        ['price'] // Schedule
    ];

    const handleNext = async () => {
        const fieldsToValidate = STEP_FIELDS[currentStep];
        console.log(`🔍 [Wizard] Step ${currentStep} triggering validation for:`, fieldsToValidate);

        // EXTRA CHECK: Instructors (Step 5)
        if (currentStep === 5) {
            const currentInstructors = getValues('instructors');
            if (!currentInstructors || currentInstructors.length === 0) {
                addToast({ type: 'error', title: 'Instructor Required', message: 'Please add at least one instructor before proceeding.' });
                return; // Block progress
            }
        }

        try {
            const stepValid = await trigger(fieldsToValidate);
            console.log(`✅ [Wizard] Validation result:`, stepValid);

            if (stepValid) {
                if (currentStep < STEPS.length - 1) {
                    setCurrentStep(prev => prev + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        } catch (error) {
            console.error("⚠️ [Wizard] Validation error caught:", error);
        }
    };

    // Manual submission to bypass potential hidden-field issues with handleSubmit
    const handleManualSubmit = async () => {
        console.log("🚀 [Wizard] Manual Submit Triggered");

        // 1. Trigger full validation
        const isFormValid = await trigger();
        console.log("✅ [Wizard] Full Form Valid?", isFormValid);

        if (isFormValid) {
            // 2. Get all data directly
            const formData = getValues();
            console.log("📦 [Wizard] Submitting Data:", formData);

            // 3. Call submit handler
            await onSubmit(formData);
        } else {
            console.warn("⚠️ [Wizard] Form Invalid. Errors:", methods.formState.errors);
            const errorMsg = Object.values(methods.formState.errors).map((e: any) => e.message).join(', ');
            addToast({ type: 'error', title: 'Validation Failed', message: errorMsg || 'Please check all steps for errors.' });
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const onSubmit = async (data: CreateCourse) => {
        try {
            // Filter out empty or incomplete instructors to avoid ZodError "Name required"
            const cleanedData = {
                ...data,
                instructors: data.instructors?.filter(inst => inst && inst.name && inst.name.trim().length >= 2) || []
            };

            if (mode === 'create') {
                const result = await createMutation.mutateAsync(cleanedData);
                // @ts-ignore
                if (result?.success) {
                    addToast({ type: 'success', title: 'Course Created', message: 'Redirecting...' });
                    router.push('/admin/courses');
                } else {
                    console.error('❌ Course Creation Failed via Server Action:', result);
                    // @ts-ignore
                    throw new Error(result?.error || 'Creation failed - check console for details');
                }
            } else {
                const result = await updateMutation.mutateAsync({
                    id: (initialData as any)?.id || '',
                    updates: cleanedData as any
                });
                // @ts-ignore
                if (result?.success) {
                    addToast({ type: 'success', title: 'Course Updated', message: 'Changes saved successfully.' });
                    router.push('/admin/courses');
                } else {
                    // @ts-ignore
                    throw new Error(result?.error || 'Update failed');
                }
            }
        } catch (error) {
            console.error(error);
            addToast({ type: 'error', title: 'Error', message: 'Failed to save course.' });
        }
    };

    const CurrentStepComponent = STEPS[currentStep].component;

    return (
        <FormProvider {...methods}>
            <div className="flex flex-col lg:flex-row gap-8 min-h-screen pb-20">

                {/* LEFT: Stepper Navigation */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
                        {STEPS.map((step, index) => (
                            <button
                                key={step.id}
                                type="button"
                                onClick={() => { if (index < currentStep) setCurrentStep(index); }} // Allow jumping back
                                className={`w-full text-left p-4 border-l-4 transition-all ${index === currentStep
                                    ? 'border-navy-600 bg-navy-50'
                                    : index < currentStep
                                        ? 'border-green-500 bg-white'
                                        : 'border-transparent bg-white opacity-60'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`text-sm font-semibold ${index === currentStep ? 'text-navy-900' : 'text-gray-700'}`}>
                                        {step.title}
                                    </span>
                                    {index < currentStep && <Check className="w-4 h-4 text-green-500" />}
                                </div>
                                <p className="text-xs text-gray-500 leading-tight">{step.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* RIGHT: Step Content */}
                <div className="flex-1 min-w-0">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                            }
                        }}
                    >
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[600px]">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-navy-900">{STEPS[currentStep].title}</h2>
                                <p className="text-gray-500">{STEPS[currentStep].description}</p>
                            </div>

                            <div className="relative min-h-[400px]">
                                <CurrentStepComponent />
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="mt-6 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky bottom-6 z-10">
                            <button
                                type="button"
                                onClick={handleBack}
                                disabled={currentStep === 0 || isPending}
                                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50 flex items-center gap-2"
                            >
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>

                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => methods.setValue('status', 'DRAFT')} // Quick draft save logic could go here
                                    className="text-gray-500 hover:text-navy-600 font-medium text-sm hidden sm:block"
                                >
                                    Save Draft
                                </button>

                                {currentStep === STEPS.length - 1 ? (
                                    <button
                                        type="button" // Changed from submit to button for manual handling
                                        onClick={handleManualSubmit}
                                        disabled={isPending}
                                        className="px-8 py-2.5 rounded-lg bg-navy-600 text-white hover:bg-navy-700 font-medium disabled:opacity-70 flex items-center gap-2 shadow-lg shadow-navy-200"
                                    >
                                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        {mode === 'create' ? 'Create Course' : 'Update Course'}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="px-8 py-2.5 rounded-lg bg-navy-600 text-white hover:bg-navy-700 font-medium flex items-center gap-2 shadow-lg shadow-navy-200"
                                    >
                                        Next Step <ChevronRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* DEBUG OVERLAY REMOVED */}
        </FormProvider>
    );
}
