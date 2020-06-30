import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles(theme => ({
  progress: {
    margin: theme.spacing(2),
  },
}));

export default function CircularIndeterminate() {
  const classes = useStyles();

  return (
    <div>
        <div style={{zIndex:100, position:'fixed',width:'100%', height:'100vh', backgroundColor:'gray', opacity:.5, left:0, top:0}}>

        </div>
      <CircularProgress className={classes.progress} style={{left: '50%',top: '50%', color:'#fff', zIndex:101,position: 'absolute', marginLeft:'auto', marginRigh:'auto'}}/>
      
    </div>
  );
}