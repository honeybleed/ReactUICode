import {render} from "react-dom";
import {BrowserRouter} from "react-router-dom";
import {MainWinView} from "./window-views/main-window-view";
import React from "react";
import './style.scss';
import '../theme-style/theme.default.scss';
render((
    <BrowserRouter>
        <MainWinView/>
    </BrowserRouter>
), document.getElementById("react-root"));