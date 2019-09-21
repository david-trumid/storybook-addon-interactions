import {
  ADDON_ID,
  ACTION_EVENT_ID,
  DECORATOR_NAME,
  PARAM_KEY,
  WORKFLOW_EVENT_ID,
} from './index';

addons.register(ADDON_ID, api =>
  addons.add(PANEL_ID, {
    type: 'panel',
    title: PANEL_TITLE,
    render: ({ active }) => (
      <InteractionsPanel active={active} api={api} key={ADDON_ID} />
    ),
  }),
);
