import { useCallback, useEffect, useRef, useState } from 'react';
import { WorkflowConfigProps } from '../WorkflowConstants';
import { Variables } from '../WorkflowConstants';
import { ComponentsProps } from '../WorkflowConstants';
import { ChangeItem, ChangeType, OperationType } from './SaveHistoryHooks';

export const usePropsChange = ({ workflowInfo, variables, componentsProps, saveHistory }: { workflowInfo: WorkflowConfigProps, variables: Variables[], componentsProps: ComponentsProps, saveHistory: (changes: ChangeItem[]) => void }) => {
    const [workflowInfoProps, setWorkflowInfoProps] = useState(workflowInfo);
    const [variablesProps, setVariablesProps] = useState({ variables });
    const [componentsPropsProps, setComponentsPropsProps] = useState(componentsProps);
    const [targetTab, setTargetTab] = useState({workflowprops:0});


    const handleWorkflowPropsChange = useCallback((id: string, props: any) => {
        switch (id) {
            case 'workflowInfo':
                saveHistory([{ type: ChangeType.WORKFLOW, operation: OperationType.UPDATE, currentValue: props, id: 'workflowInfo', previousValue: { ...workflowInfoProps } }]);
                workflowInfoProps.name = props.name;
                workflowInfoProps.description = props.description;
                break;
            case 'variables':
                saveHistory([{ type: ChangeType.VARIABLES, operation: OperationType.UPDATE, currentValue: { variables: props }, id: 'variables', previousValue: {variables:[...variablesProps.variables]} }]);
                variablesProps.variables = props;
                break;
            default:
                saveHistory([{ type: ChangeType.PROPS, operation: OperationType.UPDATE, currentValue: props, id: id, previousValue: componentsPropsProps[id] }]);
                componentsPropsProps[id] = props;
                break;
        }
    }, []);

    const handlePropsReset = useCallback((id: string, props: any) => {
        switch (id) {
            case 'workflowInfo':
                setWorkflowInfoProps({ ...props });
                setTargetTab({'workflowprops':0});
                break;
            case 'variables':
                setVariablesProps({ ...props });
                setTargetTab({'workflowprops':1});
                break;
            default:
                setComponentsPropsProps({ ...componentsPropsProps, [id]: props });
                break;
        }
    }, []);

    return { workflowInfoProps, variablesProps, componentsPropsProps, targetTab, handleWorkflowPropsChange, handlePropsReset };
}