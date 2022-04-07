import { NextComponentType } from 'next';
import React, { ChangeEventHandler, FocusEventHandler, MouseEventHandler, useCallback, useRef, useState } from 'react';

export interface EditableLabelProps {
    value: string,
    onValueChanged: (value: string) => void,
    transformer?: (before: string) => string
}

const EditableLabel: NextComponentType<{}, {}, EditableLabelProps> = (props) => {
    const {
        value, onValueChanged, transformer = (before) => before
    } = props;

    const [isEditing, setIsEditing] = useState(false);
    const [currentState, setCurrentState] = useState('');

    const valueBeforeEditRef = useRef('');

    const onStartEdit: MouseEventHandler<HTMLInputElement> = useCallback(() => {
        valueBeforeEditRef.current = value;
        setCurrentState(value);
        setIsEditing(true);
    }, [value]);

    const onChangeInput: ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
        setCurrentState(event.target.value);
    }, []);

    const onBlurInput: FocusEventHandler<HTMLInputElement> = useCallback(() => {
        setIsEditing(false);

        const transformedValue = transformer(currentState);

        if (transformedValue === valueBeforeEditRef.current) return;

        onValueChanged(transformedValue);
    }, [currentState, onValueChanged, transformer]);
    
    if (!isEditing) {
        return <span onClick={onStartEdit}>{value}</span>
    }

    return (
        <input autoFocus
            value={currentState}
            onChange={onChangeInput}
            onBlur={onBlurInput}
        />
    );
}

export default EditableLabel;
