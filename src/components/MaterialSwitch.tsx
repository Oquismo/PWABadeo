
import { Switch, SwitchProps, styled } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const MaterialSwitch = styled((props: SwitchProps) => {
  return (
    <Switch
      focusVisibleClassName="Mui-focusVisible"
      disableRipple
      icon={
        <div className="material-switch-thumb">
          <CloseIcon style={{ fontSize: 16, color: '#666' }} />
        </div>
      }
      checkedIcon={
        <div className="material-switch-thumb material-switch-thumb-checked">
          <CheckIcon style={{ fontSize: 16, color: '#000' }} />
        </div>
      }
      {...props}
    />
  );
})(({ theme }) => ({
  width: 56,
  height: 34,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 3,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(22px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: '#34C759',
        opacity: 1,
        border: 0,
      },
      '& .material-switch-thumb': {
        backgroundColor: '#fff',
        boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#fff',
      border: '6px solid #fff',
      backgroundColor: '#34C759',
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: 'transparent',
    width: 28,
    height: 28,
    '&:before': {
      display: 'none',
    },
  },
  '& .material-switch-thumb': {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
  },
  '& .MuiSwitch-track': {
    borderRadius: 17,
    border: 'none',
    backgroundColor: '#E5E5EA',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 300,
    }),
    height: 34,
  },
}));

export default MaterialSwitch;
