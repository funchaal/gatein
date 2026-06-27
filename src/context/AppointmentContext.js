
import React, { createContext, useState } from 'react';

export const AppointmentContext = createContext();

export const AppointmentProvider = ({ children }) => {
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    return (
        <AppointmentContext.Provider value={{ selectedAppointment, setSelectedAppointment }}>
            {children}
        </AppointmentContext.Provider>
    );
};
