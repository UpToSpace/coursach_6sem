import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { TicketsPage } from "./pages/TicketsPage";
import { TicketPage } from "./pages/TicketPage";
import { BuyTicketPage } from "./pages/BuyTicketPage";
import { AuthPage } from "./pages/AuthPage";
import { MainPage } from "./pages/MainPage";
import { MapPage } from "./pages/MapPage";
import { AdminTicketTypesPage } from "./pages/admin/AdminTicketTypesPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AdminTicketTypesUpdatePage } from "./pages/admin/AdminTicketTypesUpdatePage";
import { AdminStopsPage } from "./pages/admin/AdminStopsPage";
import { AdminRoutesPage } from "./pages/admin/AdminRoutesPage";
import { AdminPage } from "./pages/admin/AdminPage";
import { AdminSchedulePage } from "./pages/admin/AdminSchedulePage";

export const useRoutes = (isAuthenticated) => {
    if (isAuthenticated) {
        return (
            <Routes>
                <Route path="/tickets/buy" element={<BuyTicketPage />} />
                <Route path="/tickets" element={<TicketsPage />} />
                <Route path="/tickets/:id" element={<TicketPage />} />
                <Route path="/admin" exact element={<AdminPage />} />
                <Route path="/admin/stops" exact element={<AdminStopsPage />} />
                <Route path="/admin/routes" exact element={<AdminRoutesPage />} />
                <Route path="/admin/schedule" exact element={<AdminSchedulePage />} />
                <Route path="/admin/tickets" exact element={<AdminTicketTypesPage />} />
                <Route path="/admin/tickets/:id" element={<AdminTicketTypesUpdatePage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/" exact element={<MainPage />} />
                <Route path="*" element={<NotFoundPage />} />
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