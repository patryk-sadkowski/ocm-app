import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";

import { ChakraProvider } from "@chakra-ui/react";
import Header from "./components/Header";
import { AuthProvider } from "./context/AuthContext";
import Repositories from "./routes/Repositories";
import Cors from "./routes/Cors";
import Home from "./routes/Home";
import Login from "./routes/Login";
import RepositoryExport from "./routes/RepositoryExport";
import AssetsImport from "./routes/AssetsImport";
import GenerateDistributorPages from "./routes/GenerateDistributorPages";
import InfinityIQ from "./routes/InfinityIQ";
import PasswordProtection from "./components/WithPasswordProtection";

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
          <Route path="/repositories" element={<Repositories />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/cors" element={<Cors />}></Route>
          <Route path="/repository-export" element={<RepositoryExport />}></Route>
          <Route path="/assets-import" element={<AssetsImport />}></Route>
          <Route path="/generate-distributor-pages" element={<GenerateDistributorPages />}></Route>
          <Route path="/infinity-iq" element={
            <PasswordProtection password={"infinityiq"}>
              <InfinityIQ />
            </PasswordProtection>
          }></Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
};

export default withChakra(App);
