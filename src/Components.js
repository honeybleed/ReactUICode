import React from "react";
import {render} from "react-dom";
import {BrowserRouter} from "react-router-dom";
import {LayoutView} from "./ui-docs/views";

import "./theme-style/theme.default.scss";

render((
    <BrowserRouter>
        <LayoutView date={new Date()}/>
    </BrowserRouter>), document.getElementById("react-root"));