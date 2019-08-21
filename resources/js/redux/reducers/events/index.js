import { 
  FETCHED_EVENTS,
  SELECTED_CURRENT_EVENT
} from '../../actions/events/types';

const initialState = {
  events: [],
  current: {}
};

export default function (state = initialState, action) {
  switch (action.type) {
    case FETCHED_EVENTS:
      return {
        ...state,
        events: action.payload
      };
    case SELECTED_CURRENT_EVENT:
      return {
        ...state,
        current: state.events.find(event => event._id === action.payload.id)
      };
    default:
      return state;
  }
}