import {useEffect, useState, useMemo} from "react";
import Box from "@mui/material/Box";
import AppHeader from "./AppHeader.tsx";
import CssBaseline from "@mui/material/CssBaseline";
import * as React from "react";
import AppMenu from "./AppMenu.tsx";
import useMediaQuery from "@mui/material/useMediaQuery";
import {Outlet} from "react-router-dom";
import MuiToolbar from "@mui/material/Toolbar";
import AppBreadcrumbs from "./AppBreadcrumbs.tsx";
import {Theme, styled} from "@mui/material/styles";
import {SettingsProvider, useSettings} from "../AppContext.tsx";

// 创建一个自定义的 Toolbar 组件
const Toolbar = styled(MuiToolbar)({
    minHeight: '50px !important',
    '@media (min-width: 600px)': {
        minHeight: '50px !important',
    }
});

interface NavProps {
    menus: Array<{
        key: string;
        label: string;
        children?: Array<{
            key: string;
            label: string;
        }>;
    }>;
}

const drawerWidth = 230;

export default ({menus}: NavProps) => {
    const [open, setOpen] = useState(true);
    const downLG = useMediaQuery((theme: Theme) => theme.breakpoints.down("lg"));
    const {t} = useSettings() || { t: (key: string) => key };
    const cmenus = useMemo(() => {
        return menus.map((el) => {
            //const newEl = {...el, label: t(`menu.${el.key}`)};
            const newEl = {...el, label: el.label};
            if (el.children) {
                newEl.children = newEl.children.map((cel) => ({
                    ...cel,
                    //label: t(`menu.${cel.key}`),
                    label: cel.label
                }));
            }
            return newEl;
        });
    }, [t, menus]);

    useEffect(() => {
        setOpen(!downLG);
    }, [downLG]);

    return (
        <Box sx={{
            display: "flex",
            height: "100vh",
            overflow: "hidden"
        }}>
            <CssBaseline/>
            <AppHeader
                drawerOpen={open}
                drawerWidth={drawerWidth}
                setOpen={setOpen}
                //homeName={t("menu.home")}
                homeName={"home"}
                menus={cmenus}
            />
            <AppMenu
                width={drawerWidth}
                menus={cmenus}
                open={open}
                drawerStyle={{backgroundColor: "#00405c"}}
            />
            <Box
                component="main"
                sx={{
                    width: "100%",
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                    overflow: 'hidden'
                }}
            >
                <Toolbar />
                {/* <Box sx={{
                    p: {xs: 1, sm: 1},
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'background.default',
                    zIndex: 1,
                }}>
                    <AppBreadcrumbs menus={cmenus} homeName={t("menu.home")}/>
                </Box> */}
                <Box sx={{
                    p: 1,
                    flexGrow: 1,
                    overflow: 'auto',
                    '&::-webkit-scrollbar': {
                        width: '8px',
                        height: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        borderRadius: '4px',
                        '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.3)',
                        },
                    },
                }}>
                    <Outlet/>
                </Box>
            </Box>
        </Box>
    );
};
