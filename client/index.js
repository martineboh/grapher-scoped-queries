import React, {Component} from 'react';
import {render} from 'react-dom';
import {withQuery} from 'meteor/cultofcoders:grapher-react';
import {tasksQuery, tasksScopedQuery, usersQuery} from "../imports/queries";

const TasksList = props => {
    const {isLoading, data: tasks} = props;
    if (isLoading) {
        return null;
    }

    return (
        <ul>
            {tasks.map(task => <li key={task._id}>{`${task.name} - prio ${task.priority}`}</li>)}
        </ul>
    );
};

const TasksListWrapper = withQuery(props => {
    return tasksQuery.clone({
        priority: props.priority,
    });
}, {
    reactive: true,
})(TasksList);

const TasksListScopedWrapper = withQuery(props => {
    return tasksScopedQuery.clone({
        priority: props.priority,
    });
}, {
    reactive: true,
})(TasksList);

const UsersList = props => {
    const {isLoading, data: users} = props;
    if (isLoading) {
        return null;
    }

    return (
        <ul>
            {users.map(user => <li key={user._id}>{`${user.name} - friends ${user.friends.map(({name}) => name).join(', ')}`}</li>)}
        </ul>
    );
};

const UsersListWrapper = withQuery(props => {
    return usersQuery.clone({
        name: props.name,
    });
}, {
    reactive: true,
})(UsersList);

class App extends Component {
    render() {
        return (
            <div>
                <h2>
                    Available Queries
                </h2>
                <div>
                    <ul>
                        <li>
                            tasksQuery - not scoped, fetches tasks by priority
                        </li>
                        <li>
                            tasksScopedQuery - scoped, fetches tasks by priority
                        </li>
                        <li>
                            usersQuery - scoped, fetches users by name
                        </li>
                    </ul>
                </div>

                <h2>Case 1: interquery collisions</h2>
                <h3>Without scope - tasksQuery</h3>
                <div>
                    <p>
                        Using <b>tasksQuery</b> and filtering by priority=1.
                    </p>
                    <TasksListWrapper priority={1} />
                </div>

                <div>
                    <p>
                        Using <b>tasksQuery</b> and filtering by priority=2.
                    </p>
                    <TasksListWrapper priority={2} />
                </div>

                <p>"Normal" query that does not do any client side filtering does not work as expected. All task documents are merged because datasets are merged on the client side.</p>

                <h3>Scoped - tasksScopedQuery</h3>
                <div>
                    <p>
                        Using <b>tasksScopedQuery</b> and filtering by priority=1.
                    </p>
                    <TasksListScopedWrapper priority={1} />
                </div>

                <div>
                    <p>
                        Using <b>tasksScopedQuery</b> and filtering by priority=2.
                    </p>
                    <TasksListScopedWrapper priority={2} />
                </div>

                <p>Scoped query works as expected because its documents are filtered by subscriptionId and since this is unique for each subscription.</p>

                <h2>Case 2: intraquery collsions</h2>
                <h3>With scope, with linked collection the same as starting collection</h3>
                <div>
                    <UsersListWrapper name="User 4" />
                </div>

                <p>
                    It is expected to see only User 4 in the list above.
                </p>
            </div>
        );
    }
}

Meteor.startup(() => {
    render(<App />, document.getElementById('render-target'));
});
