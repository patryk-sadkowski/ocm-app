import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";

import { ChakraProvider } from "@chakra-ui/react";
import Header from "./components/Header";
import { AuthProvider } from "./context/AuthContext";
import Repositories from "./routes/Assets";
import Cors from "./routes/Cors";
import Home from "./routes/Home";
import Login from "./routes/Login";
import Repository from "./routes/Repository";
import AssetsImport from "./routes/AssetsImport";

const withChakra = (Component: React.FC) => {
  return () => (
    <ChakraProvider>
      <Component />
    </ChakraProvider>
  );
};

const App = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <Header />

        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/assets" element={<Repositories />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/cors" element={<Cors />}></Route>
          <Route path="/repository" element={<Repository />}></Route>
          <Route path="/assets-import" element={<AssetsImport />}></Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
};

export default withChakra(App);
