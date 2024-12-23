import { SvgIconComponent } from '@mui/icons-material';
import StorageIcon from '@mui/icons-material/Storage';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import MergeIcon from '@mui/icons-material/Merge';
import ListAltIcon from '@mui/icons-material/ListAlt';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import CallMergeIcon from '@mui/icons-material/CallMerge';

// Import source components
import DelimiterReaderProps from './components/source/DelimiterReaderProps';
import SharedFolderProps from './components/source/SharedFolderProps';
import SFTPProps from './components/source/SFTPProps';
import FileUploaderProps from './components/source/FileUploaderProps';

// Import datatransform components
import FilterProps from './components/datatransform/FilterProps';
import JoinProps from './components/datatransform/JoinProps';
import SelectProps from './components/datatransform/SelectProps';
import GroupProps from './components/datatransform/GroupProps';
import UnionProps from './components/datatransform/UnionProps';

// Import output components
import ExcelWriterProps from './components/output/ExcelWriterProps';
import CsvWriterProps from './components/output/CsvWriterProps';

// Import common component
import CommonComponentProps from './components/CommonComponentProps';
import { FormField, FormGroup } from '../../component/form/PowerForm';
import ReaderProps from './components/source/ReaderProps';

interface ETLComponentProps {
}


export interface ETLComponent {
  name: string;
  label: string;
  icon: SvgIconComponent;
  props: ETLComponentProps;
  component: React.ComponentType<any>;
  form?: FormConfig;
  description?: string;
}

export interface ETLGroup {
  label: string;
  name: string;
  components: ETLComponent[];
}
export interface FormConfig {
  group?: FormGroup;
  fields: FormField[];
}
export interface ComponentPropsProps {
  form: FormConfig;
  id: string;
  props: any;
  description?: string;
  onChange?: (id: string, values: any) => void;
}

const delimiterReaderForm: FormConfig = {
  fields: [
    {
      name: 'hasHeader',
      label: 'Has Header',
      type: 'checkbox'
    },
    {
      name: 'skipRows',
      label: 'Skip Rows',
      type: 'number',
      required: true
    },
    {
      name: 'delimiter',
      label: 'Delimiter',
      type: 'select',
      required: true,
      options: [
        { label: 'Comma (,)', value: ',' },
        { label: 'Tab (\\t)', value: '\t' },
        { label: 'Semicolon (;)', value: ';' }
      ]
    },
    {
      name: 'encoding',
      label: 'Encoding',
      type: 'select',
      required: true,
      options: [
        { label: 'UTF-8', value: 'utf-8' },
        { label: 'GBK', value: 'gbk' },
        { label: 'GB2312', value: 'gb2312' },
        { label: 'GB18030', value: 'gb18030' },
        { label: 'ISO-8859-1', value: 'iso-8859-1' },
        { label: 'ISO-8859-2', value: 'iso-8859-2' },
        { label: 'ISO-8859-3', value: 'iso-8859-3' },
        { label: 'ISO-8859-4', value: 'iso-8859-4' },
        { label: 'ISO-8859-5', value: 'iso-8859-5' },
        { label: 'ISO-8859-6', value: 'iso-8859-6' }
      ],
      group: 'advanced'
    },
    {
      name: 'multiLine',
      label: 'Multi Line',
      type: 'checkbox',
      group: 'advanced'
    },
    {
      name: 'escape',
      label: 'Escape',
      type: 'select',
      options: [
        { label: 'Backslash (\\)', value: '\\' },
        { label: 'Double Quote (")', value: '"' },
        { label: "Single Quote (')", value: "'" }
      ],
      group: 'advanced'
    },
    {
      name: 'quote',
      label: 'Quote',
      type: 'select',
      options: [
        { label: 'Double Quote (")', value: '"' },
        { label: "Single Quote (')", value: "'" }
      ],
      group: 'advanced'
    }
  ],
  group: {
    'advanced': {
      name: 'Advanced',
      collapse: { open: false },
      header: 'more',
    }
  }
};

const sharedFolderForm: FormConfig = {
  fields: [
    {
      name: 'path',
      label: 'Folder Path',
      type: 'textinput',
      required: true
    },
    {
      name: 'username',
      label: 'Process ID',
      type: 'textinput',
      required: true
    }
  ]
};

const sftpOutputForm: FormConfig = {
  fields: [
    {
      name: 'path',
      label: 'Folder Path',
      type: 'textinput',
      required: true
    },
    {
      name: 'username',
      label: 'Process ID',
      type: 'textinput',
      required: true
    }
  ]
}

const sharedFolderOutputForm: FormConfig = {
  fields: [
    {
      name: 'path',
      label: 'Folder Path',
      type: 'textinput',
      required: true
    },
    {
      name: 'username',
      label: 'Process ID',
      type: 'textinput',
      required: true
    }
  ]
};

export const etlComponents: ETLGroup[] = [
  {
    label: 'Source',
    name: 'source',
    components: [
      {
        name: 'CSVReader',
        label: 'CSV Reader',
        icon: StorageIcon,
        props: { delimiter: ',', encoding: 'utf-8', hasHeader: true, skipRows: 0, multiLine: false, escape: '"', quote: '"' },
        component: ReaderProps,
        form: delimiterReaderForm,
        description: 'Reads CSV (Comma-Separated Values) files. It supports different delimiters like comma, tab, and semicolon, and can handle files with or without headers.'
      },
      {
        name: 'SharedFolder',
        label: 'Shared Folder',
        icon: FolderSharedIcon,
        props: {},
        component: CommonComponentProps,
        form: sharedFolderForm,
        description: 'Reads files from a shared folder. It requires a process ID to access the folder.'
      },
      {
        name: 'SFTP',
        label: 'SFTP',
        icon: CloudSyncIcon,
        props: {},
        component: SFTPProps,
        description: 'Reads files from an SFTP server. It requires a process ID to access the server.'
      },
      {
        name: 'Fileuploader',
        label: 'File Uploader',
        icon: UploadFileIcon,
        props: {},
        component: FileUploaderProps,
        description: 'Uploads files from a local directory to the server.'
      }
    ]
  },
  {
    label: 'Data Transform',
    name: 'datatransform',
    components: [
      {
        name: 'Filter',
        label: 'Filter',
        icon: FilterAltIcon,
        props: {},
        component: FilterProps,
        description: 'Filters data based on specified conditions. It allows you to select columns, define conditions, and specify output columns.'
      },
      {
        name: 'Join',
        label: 'Join',
        icon: MergeIcon,
        props: {},
        component: JoinProps,
        description: 'Joins two datasets based on a specified condition. It allows you to select columns, define conditions, and specify output columns.'
      },
      {
        name: 'Select',
        label: 'Select',
        icon: ListAltIcon,
        props: {},
        component: SelectProps,
        description: 'Selects specific columns from a dataset. It allows you to select columns and specify output columns.'
      },
      {
        name: 'Group',
        label: 'Group',
        icon: GroupWorkIcon,
        props: {},
        component: GroupProps,
        description: 'Groups data based on specified columns. It allows you to select columns, define grouping criteria, and specify output columns.'
      },
      {
        name: 'Union',
        label: 'Union',
        icon: CallMergeIcon,
        props: {},
        component: UnionProps,
        description: 'Combines multiple datasets into a single dataset. It allows you to select columns and specify output columns.'
      }
    ]
  },
  {
    label: 'Output',
    name: 'output',
    components: [
      {
        name: 'ExcelWriter',
        label: 'Excel Writer',
        icon: StorageIcon,
        props: {},
        component: ExcelWriterProps,
        description: 'Writes data to an Excel file. It allows you to select columns and specify output columns.'
      },
      {
        name: 'CsvWriter',
        label: 'Csv Writer',
        icon: StorageIcon,
        props: {},
        component: CsvWriterProps,
        description: 'Writes data to a CSV file. It allows you to select columns and specify output columns.'
      },
      {
        name: 'SFTP',
        label: 'SFTP',
        icon: CloudSyncIcon,
        props: {},
        component: CommonComponentProps,
        form: sftpOutputForm,
        description: 'Writes data to an SFTP server. It requires a process ID to access the server.'
      },
      {
        name: 'SharedFolder',
        label: 'Shared Folder',
        icon: FolderSharedIcon,
        props: {},
        component: CommonComponentProps,
        form: sharedFolderOutputForm,
        description: 'Writes data to a shared folder. It requires a process ID to access the folder.'
      }
    ]
  }
];

export const iconColors = {
  'source': '#1976d2',
  'datatransform': '#2e7d32',
  'output': '#ed6c02',
} as const;

export type GroupType = keyof typeof iconColors;

export type NodeStatus = 'SUCCESS' | 'FAIL' | undefined;

export const ComponentDefaultProps = etlComponents.reduce((acc, group) => {
  group.components.forEach(component => {
    acc[component.name] = component.props;
  });
  return acc;
}, {} as Record<string, ETLComponentProps>);

export interface NodeData {
  name: string;
  label: string;
  group: string;
  status?: NodeStatus;
  props: any;
}
