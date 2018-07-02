import React, { Component } from 'react';
import pathToRegexp from 'path-to-regexp';
import PathUtils from 'path';

class Router extends Component {
    constructor(props) {
        super(props);

        this.state = {
            views: Array(props.config.views.length).fill({
                path: null,
                element: null
            })
        };
    }

    componentDidMount() {
        window.addEventListener('hashchange', this.onLocationChanged);
        this.onLocationChanged();
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.onLocationChanged);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.views !== this.state.views;
    }

    onLocationChanged = () => {
        const hashIndex = window.location.href.indexOf('#');
        const hashPath = hashIndex === -1 ? '' : window.location.href.substring(hashIndex + 1);
        const path = PathUtils.join('/', hashPath);
        if (hashPath !== path) {
            window.location.replace(`#${path}`);
            return;
        }

        for (let viewConfigIndex = 0; viewConfigIndex < this.props.config.views.length; viewConfigIndex++) {
            const viewConfig = this.props.config.views[viewConfigIndex];
            for (const routeConfig of viewConfig.routes) {
                const keys = [];
                const regexp = pathToRegexp(routeConfig.path, keys, {
                    strict: false,
                    sensitive: false,
                    end: true,
                    ...routeConfig.options
                });
                const match = regexp.exec(path);
                if (match) {
                    this.setState(({ views }) => ({
                        views: views.map((view, viewIndex) => {
                            if (viewIndex > viewConfigIndex) {
                                return {
                                    path: null,
                                    element: null
                                };
                            } else if (viewIndex === viewConfigIndex) {
                                return {
                                    path,
                                    element: React.createElement(routeConfig.component)
                                };
                            } else {
                                return view;
                            }
                        })
                    }));
                    return;
                }
            }
        }

        window.location.replace('#/');
    }

    render() {
        return (
            <div className={this.props.routerContainerClassName}>
                {
                    this.state.views
                        .filter(({ element }) => React.isValidElement(element))
                        .map(({ path, element }) => <div key={path} className={this.props.routeContainerClassName}>{element}</div>)
                }
            </div>
        );
    }
}

export default Router;