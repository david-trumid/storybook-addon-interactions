import addons, { makeDecorator } from '@storybook/addons';
import { STORY_RENDERED } from '@storybook/core-events';
import { useEffect, useCallback, useMemo, useState } from 'react';

import './styles.css';

const ADDON_ID = 'interactions';
const ACTION_EVENT_ID = `${ADDON_ID}/action-event`;
const WORKFLOW_EVENT_ID = `${ADDON_ID}/workflow-event`;

const PANEL_ID = `${ADDON_ID}/panel`;

const DECORATOR_NAME = 'withInteractions';
const PANEL_TITLE = 'Interactions';
const PARAM_KEY = 'interactions';

let interactionState;

export function setInteractionState(value) {
  interactionState = value;
}

export function getInteractionState() {
  return interactionState;
}

const Actions = ({ api, interactions = [] }) => {
  const actions = useMemo(
    () => interactions.filter(({ workflow }) => !workflow),
    [interactions],
  );

  return !actions.length ? null : (
    <div className="section">
      <div className="header">Actions</div>

      <div key={PANEL_ID}>
        {actions.map(({ name }) => (
          <button
            className="actionButton"
            key={`action-${ADDON_ID}-${name}`}
            onClick={() => api.emit(`${ACTION_EVENT_ID}-${name}`)}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
};

const Workflows = ({ api, interactions = [] }) => {
  const workflows = useMemo(
    () => interactions.filter(({ workflow }) => workflow),
    [interactions],
  );

  return !workflows.length ? null : (
    <div className="section">
      <div className="header">Workflow</div>

      <div className="workflowItems" key={PANEL_ID}>
        {workflows.map(({ name }, index) => (
          <div
            className="workflowStep"
            key={`workflow-${ADDON_ID}-${name}`}
            onClick={() => api.emit(`${WORKFLOW_EVENT_ID}-${name}`)}
          >
            Step {index + 1}: {name}
          </div>
        ))}
      </div>
    </div>
  );
};

const InteractionsPanel = ({ active, api }) => {
  const [interactions, setInteractions] = useState([]);

  const onStoryChange = useCallback(
    id => setInteractions(api.getParameters(id, PARAM_KEY)),
    [],
  );

  useEffect(() => {
    api.on(STORY_RENDERED, onStoryChange);

    return () => api.off(STORY_RENDERED, onStoryChange);
  }, []);

  if (!active || !interactions) return null;

  return (
    <div className="interactions">
      <Actions api={api} interactions={interactions} />

      <Workflows api={api} interactions={interactions} />
    </div>
  );
};

export const withInteractions = makeDecorator({
  name: DECORATOR_NAME,
  parameterName: PARAM_KEY,
  skipIfNoParametersOrOptions: true,
  wrapper: (getStory, context, { parameters }) => {
    const channel = addons.getChannel();

    const story = getStory(context);

    parameters.forEach(({ name, task, workflow }) => {
      const eventId = `${
        workflow === undefined ? ACTION_EVENT_ID : WORKFLOW_EVENT_ID
      }-${name}`;

      channel.removeAllListeners(eventId);

      channel.addListener(eventId, () => {
        task(getInteractionState(), story);
      });
    });

    return story;
  },
});

export default function() {
  addons.register(ADDON_ID, api =>
    addons.add(PANEL_ID, {
      type: 'panel',
      title: PANEL_TITLE,
      render: ({ active }) => (
        <InteractionsPanel active={active} api={api} key={ADDON_ID} />
      ),
    }),
  );
}
