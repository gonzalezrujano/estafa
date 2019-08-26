import {
  SET_SHOW_RIGHT_NOW,
  SET_NEXT_SHOW,
  SET_LAST_SHOW,
  TURN_JOB_OFF,
  EXECUTE_JOB
} from './../../actions/show/types';

const initialState = {
  flash: {
    running: false,
    current: null,
    queue: [],
  },
  colors: {
    running: false,
    current: null,
    queue: [],
  },
};

export default function (state = initialState, action) {
  let show = '';
  let queue = [];
  let orderedQueue = [];

  switch (action.type) {
    case SET_SHOW_RIGHT_NOW:
      show = getShowType(action.payload.job.type);
      return {
        ...state,
        [show]: {
          ...state[show],
          current: action.payload.job,
          running: true,
        }
      };
    case SET_NEXT_SHOW:
      show = getShowType(action.payload.job.type);
      queue = [action.payload.job, ...state[show].queue];
      orderedQueue = queue.sort(sortQueue);

      return {
        ...state,
        [show]: {
          ...state[show],
          queue: orderedQueue
        }
      };
    case SET_LAST_SHOW:
      show = getShowType(action.payload.job.type);
      queue = [...state[show].queue, action.payload.job];
      orderedQueue = queue.sort(sortQueue);
      
      return {
        ...state,
        [show]: {
          ...state[show],
          queue: orderedQueue
        }
      };
    case TURN_JOB_OFF:
      show = getShowType(action.payload.job.type);
      const isCurrent = state[show].current.id === action.payload.job.id;
      const next = state[show].queue[0];
      
      return {
        ...state,
        [show]: {
          running: isCurrent ? false : true,
          current: isCurrent ? next : state[show].current,
          queue: isCurrent ? (
            state[show].queue.filter((_, i) => i !== 0)
            ) : (
            state[show].queue.filter(j => j.id !== action.payload.job.id)
          ),
        }
      }
    case EXECUTE_JOB:
      show = getShowType(action.payload.type);

      return {
        ...state,
        [show]: {
          ...state[show],
          running: true,
        }
      }
    default:
      return state;
  }
}

function getShowType (type) {
  switch (type) {
    case 'COL':
      return 'colors'  
    case 'FLH':
      return 'flash'  
  }
}

function sortQueue (a, b) {
  let startTimeA = parseInt(a.startTime);
  let startTimeB =parseInt(b.startTime);
  
  if (startTimeA < startTimeB)
    return -1;

  if (startTimeA === startTimeB)
    return 0;

  if (startTimeA > startTimeB)
    return 1;
}