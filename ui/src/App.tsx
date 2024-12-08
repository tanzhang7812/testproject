import React, {Suspense, useEffect, useMemo, useState} from "react";
import {createTheme, ThemeProvider} from "@mui/material/styles";

import {green, orange} from "@mui/material/colors";
import {BrowserRouter, RouterProvider} from "react-router-dom";
import {createBrowserRouter} from "react-router-dom";
import Home from "@mui/icons-material/Home";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import HandymanIcon from "@mui/icons-material/Handyman";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import TableViewIcon from '@mui/icons-material/TableView';

import Nav from "./nav/index.tsx";
import {SettingsProvider, useSettings} from "./AppContext.tsx";
import SecurityIcon from '@mui/icons-material/Security';
import AccessControl from './pages/access-control';

const Welcome = React.lazy(() => import("./pages/Welcome.tsx"));
const Welcome2 = React.lazy(() => import("./pages/Welcome2.tsx"));
const FormDisplay = React.lazy(() => import("./pages/componentsplaybook/FormDisplay.tsx"));
const NavContentDisplayDemo = React.lazy(() => import("./pages/componentsplaybook/NavContentDisplayDemo.tsx"));
const DragZoomPopupDemo = React.lazy(() => import("./pages/componentsplaybook/DragZoomPopupDemo.tsx"));
const RichTextEditorDemo = React.lazy(() => import("./pages/componentsplaybook/RichTextEditorDemo.tsx"));
const Workspace = React.lazy(() => import("./pages/workspace/index.tsx"));
const PowerEditGridDemo = React.lazy(() => import("./pages/componentsplaybook/PowerEditGridDemo"));
const FilterDemo = React.lazy(() => import("./pages/filter-demo"));
const TableDemo = React.lazy(() => import("./pages/table-demo"));
const UserManagement = React.lazy(() => import("./pages/access-control/UserManagement"));
const GroupManagement = React.lazy(() => import("./pages/access-control/GroupManagement"));
const Entitlement = React.lazy(() => import("./pages/access-control/Entitlement"));
const EntityManagement = React.lazy(() => import("./pages/access-control/EntityManagement"));

// 添加类型定义
interface Menu {
  key: string;
  label: string;
  icon?: React.ComponentType;
  component?: JSX.Element;
  children?: Menu[];
}

interface RouterConfig {
  path: string;
  element: JSX.Element;
  children: Array<{
    path: string;
    element?: JSX.Element;
  }>;
}

function createThemeWithMode(mode: 'light' | 'dark') {
    return createTheme({
        palette: {
            mode,
        },
        typography: {
            button: {
                textTransform: 'none'
            }
        },
         // 添加组件默认样式配置
         components: {
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiInputBase-input': {
                            padding: '5px 8px', // 调整内边距
                            fontSize: '0.875rem', // 缩小字体
                        }
                    }
                }
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    input: {
                        padding: '5px 8px', // 调整内边距
                        fontSize: '0.875rem', // 缩小字体
                    }
                }
            },
            // 添加 Autocomplete 的样式配置
            MuiAutocomplete: {
                styleOverrides: {
                    root: {
                        '& .MuiInputBase-root': {
                            padding: '1px 4px !important'
                        },
                        '& .MuiAutocomplete-input': {
                            padding: '5px 4px !important',
                            fontSize: '0.875rem'
                        }
                    },
                    listbox: {
                        fontSize: '0.875rem'  // 下拉选项的字体大小
                    },
                    option: {
                        padding: '5px 8px'    // 下拉选项的内边距
                    }
                }
            }
        }
    })
}

function App() {
    const [router, setRouter] = useState<ReturnType<typeof createBrowserRouter>>();

    useEffect(() => {
        setTimeout(() => {
            const newRouter: RouterConfig = {
                path: "/",
                element: <Nav menus={cmenus}/>,
                children: [],
            };
            cmenus.forEach((el: Menu) => {
                if (el.key === "home") {
                    newRouter.children.push({path: "/", element: el.component});
                } else {
                    newRouter.children.push({
                        path: `/${el.key}`,
                        element: el.component,
                    });
                }
                if (el.children) {
                    el.children.forEach((el: Menu) => {
                        newRouter.children.push({
                            path: `/${el.key}`,
                            element: el.component,
                        });
                    });
                }
            });
            setRouter(createBrowserRouter([newRouter]));
        }, 1000);
    }, []);

    const {mode} = useSettings() || { mode: 'light' };
    const theme = React.useMemo(
        () => {
            return createThemeWithMode(mode as 'light' | 'dark')
        },
        [mode]);

    return (
        <ThemeProvider theme={theme}>
            {router ? (
                <RouterProvider router={router}/>
            ) : (
                <BrowserRouter>
                    <Nav
                        menus={[
                            {
                                key: "home",
                                label: "Home",
                                icon: Home,
                            },
                        ]}
                    />
                </BrowserRouter>
            )}
        </ThemeProvider>
    );
}

const cmenus: Menu[] = [
    {
        key: "home",
        label: "Overview",
        icon: Home,
        component: <Suspense fallback={<div>Loading...</div>}><Welcome/></Suspense>,
    },
    {
        key: "accesscontrol",
        label: "Access Control",
        icon: SecurityIcon,
        children: [
            {
                key: "security",
                label: "Entity Management",
                component: <Suspense fallback={<div>Loading...</div>}><EntityManagement/></Suspense>,
            },
            {
                key: "resources",
                label: "Entitlement",
                component: <Suspense fallback={<div>Loading...</div>}><Entitlement/></Suspense>,
            }
        ]
    },
    {
        key: "workflow",
        label: "Workflow",
        icon: MailIcon,
        component: <Suspense fallback={<div>Loading...</div>}><Workspace/></Suspense>,
    },
    {
        key: "components",
        label: "Components",
        icon: HandymanIcon,
        children: [
            {
                key: "form",
                label: "Form",
                component: <Suspense fallback={<div>Loading...</div>}><FormDisplay/></Suspense>,
            },
            {
                key: "table",
                label: "Table",
                component: <Suspense fallback={<div>Loading...</div>}><TableDemo/></Suspense>,
            },
            {
                key: "richTextEditor",
                label: "Rich Text Editor",
                component: <Suspense fallback={<div>Loading...</div>}><RichTextEditorDemo/></Suspense>,
            },
            {
                key: "contentDisplay",
                label: "Content Display",
                component: <Suspense fallback={<div>Loading...</div>}><NavContentDisplayDemo/></Suspense>,
            },
            {
                key: "dragZoomPopup",
                label: "Drag Zoom Popup",
                component: <Suspense fallback={<div>Loading...</div>}><DragZoomPopupDemo/></Suspense>,
            },
            {
                key: "editGrid",
                label: "Edit Grid",
                component: <Suspense fallback={<div>Loading...</div>}><PowerEditGridDemo/></Suspense>,
            },
            {
                key: "filterAssemble",
                label: "Filter Assemble",
                component: <Suspense fallback={<div>Loading...</div>}><FilterDemo /></Suspense>
            }
        ],
    }
];

export default App;
