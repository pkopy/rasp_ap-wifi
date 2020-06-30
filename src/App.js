import React from 'react';
import Content from "./components/Content";
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import dotenv from 'dotenv'
import SettingsIcon from '@material-ui/icons/Settings';
import ReplayIcon from '@material-ui/icons/Replay';
import Tooltip from '@material-ui/core/Tooltip';

dotenv.config()
const wifi = { name: 'kkkk', ssid: '664364374834838' }
const listWifi1 = Array(20).fill(wifi)

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        // marginRight: theme.spacing(1),
    },
    title: {
        flexGrow: 1,
    },
}));
function App() {
    const [listWifi, setWifiList] = React.useState(listWifi1)
    // React.useEffect(() => {
    //     console.log(window.location.hostname)

    //     fetch(`http://${process.env.REACT_APP_API}:9000/findwifi`)
    //         .then(data => data.json())
    //         .then(data => {
    //             // const wifi = data.split('\n')
    //             setWifiList(data)
    //             // console.log(wifi)
    //         })
    // },[])
    // console.log(process.env.REACT_APP_PORT)



    const classes = useStyles();

    return (
        <div className={classes.root}>
            <AppBar position="fixed">
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        WIFI Connector
                    </Typography>
                    <Tooltip title="Reload">
                        <IconButton className={classes.menuButton} color="inherit" aria-label="reload" onClick={() => window.location.reload()}>
                            
                            <ReplayIcon />
                        </IconButton>

                    </Tooltip>
                    <IconButton className={classes.menuButton} color="inherit" aria-label="settings" >
                        <SettingsIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Content
                wifiList={listWifi}
            />

        </div>
    );
}

export default App;
