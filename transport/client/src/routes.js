import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { TicketsPage } from "./pages/TicketsPage";
import { TicketPage } from "./pages/TicketPage";
import { BuyTicketPage } from "./pages/BuyTicketPage";
import { AuthPage } from "./pages/AuthPage";
import { MainPage } from "./pages/MainPage";
import { MapPage } from "./pages/MapPage";

export const useRoutes = (isAuthenticated) => {
    if (isAuthenticated) {
        return (
            <Routes>
                <Route path="/tickets/buy" element={<BuyTicketPage />} />
                <Route path="/tickets" element={<TicketsPage />} />
                <Route path="/tickets/:id" element={<TicketPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/" exact element={<MainPage />} />
                <Route path="*" element={<MainPage />} />
            </Routes>
        );
    }

    return (
        <Routes>
            <Route path="*" exact element={
                <AuthPage />
            } />
            {/* <Route path="*" element={
                <Navigate to="/" />
            } /> */}
        </Routes>
    );
}