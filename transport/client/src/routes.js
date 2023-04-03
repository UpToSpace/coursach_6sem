import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { LinksPage } from "./pages/LinksPage";
import { BuyTicketPage } from "./pages/BuyTicketPage";
import { AuthPage } from "./pages/AuthPage";

export const useRoutes = (isAuthenticated) => {
    if (isAuthenticated) {
        return (
            <Routes>
                <Route path="/links" exact element={<LinksPage />} />
                <Route path="create" element={<BuyTicketPage />} />
                <Route path="/detail/:id" exact element={<BuyTicketPage />} />
                <Route path="*" element={<Navigate to="/create" />} />
            </Routes>
        );
    }

    return (
        <Routes>
            <Route path="/" exact element={
                <AuthPage />
            } />
            <Route path="*" element={
                <Navigate to="/" />
            } />
        </Routes>
    );
}