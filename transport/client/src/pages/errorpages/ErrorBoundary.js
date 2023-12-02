import React from 'react';
import { SomethingWrongPage } from './SomethingWrongPage';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ hasError: true, error: error, errorInfo: errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return <SomethingWrongPage />;
        }
        return this.props.children;
    }
}