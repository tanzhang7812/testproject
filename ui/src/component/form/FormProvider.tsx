import React, { createContext, useContext, useState } from 'react';

interface FormContextType {
    values: Record<string, any>;
    setValues: (values: Record<string, any>) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const useForm = () => {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error('useForm must be used within a FormProvider');
    }
    return context;
};

interface FormProviderProps {
    children: React.ReactNode;
    defaultValue?: Record<string, any>;
    onValueChange?: (values: Record<string, any>) => void;
    onSubmit?: (event: React.FormEvent) => void;
    validateForm?: (values: Record<string, any>) => void;
}

const FormProvider: React.FC<FormProviderProps> = ({
    children,
    defaultValue = {},
    onValueChange,
    onSubmit,
    validateForm
}) => {
    const [values, setValues] = useState<Record<string, any>>(defaultValue);

    const handleValuesChange = (newValues: Record<string, any>) => {
        setValues(newValues);
        onValueChange?.(newValues);
        validateForm?.(newValues);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        onSubmit?.(event);
    };

    return (
        <FormContext.Provider value={{ values, setValues: handleValuesChange }}>
            <form onSubmit={handleSubmit}>
                {children}
            </form>
        </FormContext.Provider>
    );
};

export default FormProvider; 