import React, {useState, useEffect} from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getObjectProperty = (key: string, obj: any): unknown =>
    typeof obj === 'object' && obj !== null && key in obj ? obj[key] : undefined;

const hasRequiredProps = (requiredProps: string[], props: object): boolean =>
    requiredProps.some(propName => getObjectProperty(propName, props) === undefined);

type ExternalProps = {
    sideEffect: (props: unknown) => Promise<unknown>;
};

type InjectedProps = {
    wasLoaded: boolean;
    isLoading: boolean;
    error?: unknown;
};

type Options = {
    props?: string[];
    requiredProps?: string[];
    LoadingComponent?: React.ComponentType;
    ErrorComponent?: React.ComponentType;
};
const x = 1

type hasSideEffectType = ({
    props: propsToListen,
    requiredProps,
}: Options) => <OriginalProps extends {}>(
    Component: React.ComponentType<OriginalProps & InjectedProps>
) => React.FunctionComponent<OriginalProps & ExternalProps>;

const hasSideEffect: hasSideEffectType = ({
    props: propsToListen = [],
    requiredProps = [],
    LoadingComponent,
    ErrorComponent,
}) => <OriginalProps extends {}>(Component: React.ComponentType<OriginalProps & InjectedProps>) => {
    const HOC: React.FunctionComponent<OriginalProps & ExternalProps> = props => {
        const [additionalProps, setAdditionalProps] = useState({isLoading: true, wasLoaded: false, error: undefined});
        useEffect(() => {
            props
                .sideEffect(props)
                .then(() => setAdditionalProps({isLoading: false, wasLoaded: true, error: undefined}))
                .catch(error => setAdditionalProps({isLoading: false, wasLoaded: false, error}));
        }, propsToListen.map(propName => getObjectProperty(propName, props)));

        if (ErrorComponent && additionalProps.wasLoaded && (hasRequiredProps(requiredProps, props) || additionalProps.error)) {
            return <ErrorComponent />;
        }

        if (additionalProps.isLoading && !additionalProps.wasLoaded && LoadingComponent) {
            return <LoadingComponent />;
        }

        return <Component {...props} {...additionalProps} />;
    };

    return HOC;
};

export default hasSideEffect;
