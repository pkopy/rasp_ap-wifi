import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import ListItem from '@material-ui/core/ListItem';
import WifiIcon from '@material-ui/icons/Wifi';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import TextField from '@material-ui/core/TextField';
import Loader from './Loader'
import { isArray } from "util";


const useStyles = makeStyles(theme => ({
    // button: {
    //     margin: theme.spacing(1),
    // },
    input: {
        display: 'none',
    },
    wifi: {
        // border: '1px solid',
        width: '90%',
        marginTop: theme.spacing(10),
        marginBottom: theme.spacing(10),
        marginLeft: 'auto',
        marginRight: 'auto'

    },
    textField: {
        width: '100%'
    },
    title1: {
        padding: theme.spacing(3),
        align: 'center'
    },
    button: {
        marginBottom: theme.spacing(3),
        width: 300,
    }
}));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const Content = ({ styles, wifiList }) => {
    const [wifi, setWifi] = React.useState([]);
    const [pass, setPass] = React.useState('')
    const [open, setOpen] = React.useState(false);
    const [loader, setLoader] = React.useState(false)
    const [openInfo, setOpenInfo] = React.useState(false)
    const [currentWifi, setCurrentWifi] = React.useState({})
    const [connect, setConnect] = React.useState(false)
    const [connectedNet, setConnectedNet] = React.useState({})
    const [passwordError, setPasswordError] = React.useState(false)
    const handleClickOpen = (elem) => {
        setCurrentWifi(elem)
        setOpen(true);
        setPass('')
    };

    const handleClose = () => {
        setPasswordError(false)
        setOpen(false);
    };

    const handleValue = (e) => {
        setPass(e.target.value)
    }

    const setAP = () => {
        if (pass.length > 0) {
            setOpen(false)
            setPasswordError(false)
            setLoader(true)
            fetch(`http://${window.location.hostname}:4500/findwifi/?ssid=${currentWifi.SSID}&pass=${pass}`)
                .then(data => {
                    console.log(data)
                    setOpenInfo(true)
                })
                .catch(err => console.log(err))
                .finally(() => {
                    setLoader(false)
                })
            // setTimeout(() => {
            //
            // }, 15000)
        } else {
            setPasswordError(true)
        }
    }

    const clearAP = () => {
        setLoader(true)
        fetch(`http://${window.location.hostname}:4500/findwifi/?clear=0`)
        .then(data => {
            console.log(data)
            setConnect(false)
            setOpenInfo(true)
        })
        .catch(err => console.log(err))
        .finally(() => {
            setLoader(false)
            setOpenInfo(true)
        })
    }

    React.useEffect(() => {
        getWifiList()
    }, [])

    const getWifiList = () => {
        fetch(`http://${window.location.hostname}:4500/findwifi`)
            .then(data => data.json())
            .then(data => {
                console.log(data)
                data.shift()
                const infoNet = data.pop()
                if (infoNet && infoNet.wifiName === "ff/an") {
                    setConnect(false)
                } else {
                    setConnect(true)
                }

                // const nameWifi = data.pop()
                // const eth0 = data.pop()
                // const wlan0 = data.pop()
                // // console.log('eth: ', wlan0)

                // const re = /[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}/
                
                const ethIp = Array.isArray(infoNet.eth)?infoNet.eth[0]:infoNet.eth
                const wlanIp = Array.isArray(infoNet.wlan)?infoNet.wlan[0]:infoNet.wlan
                // const ethIp = re.exec(eth0) || ['0.0.0.0']
                // // console.log(ethIp, wlanIp)
                setConnectedNet({ name: infoNet.wifiName, ip: wlanIp, eth: ethIp})
                setWifi(data)
                // console.log(wlanIp[0])
            })
            .catch(err => console.log(err))
    }

    const classes = useStyles();

    return (
        <div>
            {loader&&<Loader/>}
            <Paper className={classes.wifi}>
                {wifi.length > 0 && !connect && <List >
                    {wifi.map((elem, i) =>
                        (
                            <ListItem button key={i} onClick={() => handleClickOpen(elem)} >
                                <WifiIcon></WifiIcon>
                                <ListItemText variant="h5" component="h3" style={{ marginLeft: '1rem', borderBottom: '1px solid rgb(0,0,0,0.25)' }}>
                                    <b>Name:</b> {elem.SSID}  <b>Address:</b> {elem.Address}
                                </ListItemText>

                            </ListItem>
                        )
                    )}

                </List>}

                {connect &&
                    <div>
                        <Typography variant="h6" align='center' className={classes.title1}>
                            You are connected to the network: <b>{connectedNet.name}</b>
                        </Typography>
                        <Typography variant="h6" align='center' >
                            Wlan: <b>{connectedNet.ip}</b>
                        </Typography>

                        <Typography variant="h6" align='center' >
                            Ethernet: {(connectedNet.eth && connectedNet.eth !== '0.0.0.0')?<b>{connectedNet.eth}</b>:<b>not connected</b>}
                        </Typography>

                        <div style={{width:'300px', marginLeft:'auto', marginRight:'auto', marginTop:'30px'}}>
                            <Button variant="outlined" onClick={clearAP} color="primary" className={classes.button}>
                                Reset
                            </Button>

                        </div>

                    </div>
                }

            </Paper>
            <Dialog
                open={open}
                // onEntered={}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-labelledby="alert-dialog-slide-title"
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle id="alert-dialog-slide-title">{"Type password to the network "}{currentWifi.SSID}</DialogTitle>
                <DialogContent>
                    {/* {currentWifi && <DialogContentText id="alert-dialog-slide-description">
                        {currentWifi.SSID}
                    </DialogContentText>} */}
                    <TextField
                        id="standard-password-input"
                        label="Password"
                        type="password"
                        error={passwordError}
                        className={classes.textField}
                        //    type="password"
                        onChange={handleValue}
                        value={pass}
                        autoComplete="off"
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel 
                     </Button>
                    <Button onClick={setAP} color="primary">
                        Connect
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openInfo}
                // onEntered={}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-labelledby="alert-dialog-slide-title"
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle id="alert-dialog-slide-title">{"Restart ustawień sieci "}</DialogTitle>
                <DialogContent>
                    <Typography variant="h6"  className={classes.title1}>
                        Your connection will be disconnect. Connect again.
                    </Typography>
                </DialogContent>
                <DialogActions>
                        
                        
                    <Button onClick={() =>{setOpenInfo(false); window.location.reload();}} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </Dialog>

        </div>
    );
};

export default Content;
