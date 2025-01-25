import React, { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import { Box, TextField, List, ListItem, ListItemText, Typography, Drawer, IconButton, Tooltip, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { ExpressionValidator } from './expressionValidator';
import grammarText from './expression-grammar.pegjs';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';

// Import ace modes and themes
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';
import ace from 'ace-builds';

export interface Field {
  name: string;
  dataType: 'int' | 'bigint' | 'date' | 'timestamp' | 'double' | 'decimal' | 'float' | string;
}

export interface FunctionParam {
  name: string;
  dataType: string | string[];  // Support multiple data types
  isField?: boolean;  // Whether this parameter must be a field
  description?: string;
  optional?: boolean;
}

export interface FunctionDef {
  name: string;
  params: FunctionParam[];
  returnType: string;
  category: string;
  description?: string;
}

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  fields: Field[];
  functions: FunctionDef[];
  readOnly?: boolean;
  drawerPosition?: 'left' | 'right';
  error?: boolean;
  helperText?: string;
  tooltipError?: boolean;
}

const EditorContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
}));

const EditorContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  overflow: 'hidden',
});

const FunctionPanel = styled(Box)({
  display: 'flex',
  flex: '0 0 80%',
  overflow: 'hidden',
  borderTop: '1px solid #e0e0e0',
  borderColor: 'divider',
});

const CategoryPanel = styled(Box)(({ theme }) => ({
  width: '200px',
  borderRight: `1px solid ${theme.palette.divider}`,
  overflow: 'auto',
}));

const FunctionList = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  overflowY: 'auto',
}));

const FunctionItem = styled(ListItem)(({ theme }) => ({
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: theme.spacing(1, 2),
  '& .MuiListItemText-root': {
    margin: 0,
    width: '100%',
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const FunctionDescription = styled(Box)(({ theme }) => ({
  width: '100%',
  '& .function-signature': {
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  '& .function-description': {
    marginTop: theme.spacing(0.5),
    color: theme.palette.text.secondary,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    cursor: 'pointer',
  },
}));

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
}));

const SearchBox = styled(TextField)(({ theme }) => ({
  margin: theme.spacing(2),
  marginBottom: theme.spacing(1),
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
  },
}));

// Add operators definition
const OPERATORS = [
  { symbol: '+', description: 'Addition (numeric only)' },
  { symbol: '-', description: 'Subtraction (numeric only)' },
  { symbol: '*', description: 'Multiplication (numeric only)' },
  { symbol: '/', description: 'Division (numeric only)' },
  { symbol: '<', description: 'Less than' },
  { symbol: '>', description: 'Greater than' },
  { symbol: '<=', description: 'Less than or equal' },
  { symbol: '>=', description: 'Greater than or equal' },
  { symbol: '=', description: 'Equal' },
];

const OperatorPanel = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default,
}));

const OperatorButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  width: '36px',
  height: '36px',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  '& .MuiTooltip-tooltip': {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
    fontSize: '0.875rem',
    padding: theme.spacing(1, 1.5),
    boxShadow: theme.shadows[2],
  },
  '& .MuiTooltip-arrow': {
    color: theme.palette.error.light,
  },
  zIndex: 1000,
}));

export default function CodeEditor({
  value,
  onChange,
  fields,
  functions,
  readOnly = false,
  drawerPosition = 'right',
  error = false,
  helperText,
  tooltipError = false,
}: CodeEditorProps) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchText, setSearchText] = useState('');
  const [localValue, setLocalValue] = useState(value);
  const [editor, setEditor] = useState<any>(null);
  const [validator] = useState(() => new ExpressionValidator(fields, functions, grammarText));
  const [showTooltip, setShowTooltip] = useState(false);

  // 监听 value 属性的变化
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Setup custom completers when editor is ready
  useEffect(() => {
    if (editor) {
      const customCompleter = {
        getCompletions: (
          editor: any,
          session: any,
          pos: any,
          prefix: string,
          callback: (error: null, wordList: any[]) => void
        ) => {
          // Get current line and text before cursor
          const line = session.getLine(pos.row);
          const textBeforeCursor = line.substring(0, pos.column);
          
          // Check if we need to suggest an operator
          const lastWord = textBeforeCursor.match(/\b\w+$/);
          if (lastWord && (fields.some(f => f.name === lastWord[0]) || functions.some(f => f.name === lastWord[0]))) {
            // If last word is an identifier, suggest operators
            const operatorCompletions = OPERATORS.map(op => ({
              caption: op.symbol,
              value: ' ' + op.symbol + ' ',
              meta: op.description,
              score: 1000
            }));
            callback(null, operatorCompletions);
            return;
          }

          // Prepare field completions with better descriptions
          const fieldCompletions = fields.map(field => ({
            caption: field.name,
            value: field.name,
            meta: 'Field',
            description: `Type: ${field.dataType}`,
            score: 1000,
            docHTML: `
              <div>
                <b>${field.name}</b>
                <hr/>
                <div>Type: ${field.dataType}</div>
              </div>
            `
          }));

          // Prepare function completions with better descriptions
          const functionCompletions = functions.map(func => {
            const params = func.params.map(p => {
              const dataType = Array.isArray(p.dataType) ? p.dataType.join(' | ') : p.dataType;
              return `${p.name}: ${dataType}${p.isField ? ' (field)' : ''}`;
            }).join(', ');
            
            return {
              caption: func.name,
              value: func.name,
              meta: 'Function',
              description: `${func.name}(${params}) → ${func.returnType}`,
              completer: {
                insertMatch: (editor: any, data: any) => {
                  const paramCount = func.params.length;
                  const paramPlaceholders = Array(paramCount).fill('').join(', ');
                  const functionText = data.value + '(' + paramPlaceholders + ')';
                  
                  // Get cursor position before insertion
                  const pos = editor.getCursorPosition();
                  
                  // Insert the complete function text
                  editor.removeWordLeft();
                  editor.insert(functionText);
                  
                  // Move cursor inside the parentheses if there are parameters
                  if (paramCount > 0) {
                    editor.moveCursorTo(pos.row, pos.column + data.value.length + 1);
                  }
                }
              },
              score: 1000,
              docHTML: `
                <div>
                  <b>${func.name}</b>
                  <hr/>
                  <div>Parameters:</div>
                  <ul>
                    ${func.params.map(p => {
                      const dataType = Array.isArray(p.dataType) ? p.dataType.join(' | ') : p.dataType;
                      return `<li><b>${p.name}</b>: ${dataType}${p.isField ? ' (field)' : ''}</li>`;
                    }).join('')}
                  </ul>
                  <div>Returns: ${func.returnType}</div>
                  ${func.description ? `<div>Description: ${func.description}</div>` : ''}
                </div>
              `
            };
          });

          callback(null, [...fieldCompletions, ...functionCompletions]);
        }
      };

      editor.completers = [customCompleter];
    }
  }, [editor, fields, functions]);

  // Add fields as a special category
  const fieldsCategory = {
    name: 'Available Fields',
    items: fields.map(field => ({
      name: field.name,
      description: 'Type: ' + field.dataType,
      isField: true,
    }))
  };

  // Get unique categories from functions
  const functionCategories = Array.from(new Set(functions.map(f => f.category)));
  const allCategories = ['All', 'Available Fields', ...functionCategories];

  // Filter items by search text and category
  const getFilteredItems = () => {
    let items = selectedCategory === 'All' 
      ? [...fieldsCategory.items, ...functions]
      : selectedCategory === 'Available Fields'
        ? fieldsCategory.items
        : functions.filter(f => f.category === selectedCategory);

    if (searchText) {
      const searchLower = searchText.toLowerCase();
      items = items.filter(item => {
        if (item.isField) {
          return item.name.toLowerCase().includes(searchLower) ||
                 item.description.toLowerCase().includes(searchLower);
        } else {
          return item.name.toLowerCase().includes(searchLower) ||
                 item.description?.toLowerCase().includes(searchLower) ||
                 item.params.some(p => p.name.toLowerCase().includes(searchLower));
        }
      });
    }

    return items;
  };

  const handleEditorChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleItemClick = (item: any) => {
    if (!editor) return;

    const pos = editor.getCursorPosition();
    const session = editor.getSession();
    
    if (item.isField) {
      // Insert field name at cursor position
      session.insert(pos, item.name);
    } else {
      // Insert function with empty parameters at cursor position
      const paramCount = item.params.length;
      const paramPlaceholders = Array(paramCount).fill('').join(', ');
      const functionText = item.name + '(' + paramPlaceholders + ')';
      
      session.insert(pos, functionText);
      
      // Move cursor inside the parentheses
      if (paramCount > 0) {
        editor.moveCursorTo(pos.row, pos.column + item.name.length + 1);
      }
    }
    editor.focus();
  };

  const handleOperatorClick = (operator: string) => {
    if (!editor) return;
    const pos = editor.getCursorPosition();
    const session = editor.getSession();
    const operatorText = ` ${operator} `;
    session.insert(pos, operatorText);
    editor.focus();
  };

  const getFunctionDescription = (func: FunctionDef) => {
    const params = func.params.map(p => {
      const dataType = Array.isArray(p.dataType) ? p.dataType.join(' | ') : p.dataType;
      return `${p.name}: ${dataType}${p.isField ? ' (field)' : ''}`;
    }).join(', ');
    
    return `${func.name}(${params}) → ${func.returnType}
${func.description || ''}`;
  };

  // 处理点击其他位置隐藏 tooltip
  useEffect(() => {
    if (tooltipError && error && helperText) {
      setShowTooltip(true);
      const handleClickOutside = () => {
        setShowTooltip(false);
      };
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [tooltipError, error, helperText]);

  return (
    <>
      <StyledTooltip
        open={tooltipError && error && !!helperText && showTooltip}
        title={helperText || ''}
        placement="bottom-start"
        arrow
      >
        <StyledTextField
          fullWidth
          value={value}
          onClick={(e) => {
            e.stopPropagation();
            if(fields.length>0){
              setOpen(true);
            }
          }}
          onMouseEnter={() => setShowTooltip(true)}
          InputProps={{
            readOnly: true,
          }}
          placeholder="Click to open editor"
          error={error}
          helperText={!tooltipError ? helperText : undefined}
        />
      </StyledTooltip>

      <Drawer
        anchor={drawerPosition}
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { width: '800px' },
        }}
      >
        <DrawerHeader>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Code Editor
          </Typography>
          <IconButton
            onClick={() => setOpen(false)}
            sx={{ color: 'inherit' }}
          >
            <CloseIcon />
          </IconButton>
        </DrawerHeader>

        <EditorContainer>
          <OperatorPanel>
            {OPERATORS.map((op) => (
              <Tooltip key={op.symbol} title={op.description}>
                <OperatorButton
                  size="small"
                  onClick={() => handleOperatorClick(op.symbol)}
                >
                  <Typography variant="body2" sx={{ fontSize: '1.2rem' }}>
                    {op.symbol}
                  </Typography>
                </OperatorButton>
              </Tooltip>
            ))}
          </OperatorPanel>

          <EditorContent>
            <Box sx={{ flex: '1 1 20%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <AceEditor
                mode="sql"
                theme="github"
                value={localValue}
                onChange={handleEditorChange}
                name="code-editor"
                editorProps={{ $blockScrolling: true }}
                onLoad={editor => {
                  setEditor(editor);
                  editor.setOptions({
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: false,
                    showGutter: true,
                    highlightActiveLine: true,
                  });
                  editor.container.style.resize = 'vertical';
                }}
                setOptions={{
                  enableBasicAutocompletion: true,
                  enableLiveAutocompletion: true,
                  enableSnippets: false,
                  showLineNumbers: true,
                  tabSize: 2,
                  fontSize: 14,
                  showPrintMargin: false,
                }}
                style={{ width: '100%', height: '100%' }}
                readOnly={readOnly}
              />
              {error && helperText && (
                <Box sx={{ p: 1, bgcolor: 'error.light', color: 'error.contrastText' }}>
                  <Typography variant="body2">{helperText}</Typography>
                </Box>
              )}
            </Box>

            <FunctionPanel>
              <CategoryPanel>
                <List dense>
                  {allCategories.map((category) => (
                    <ListItem
                      key={category}
                      button
                      selected={selectedCategory === category}
                      onClick={() => setSelectedCategory(category)}
                    >
                      <ListItemText 
                        primary={category}
                        primaryTypographyProps={{
                          sx: { 
                            fontWeight: selectedCategory === category ? 600 : 400,
                            color: selectedCategory === category ? 'primary.main' : 'text.primary',
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CategoryPanel>

              <FunctionList>
                <SearchBox
                  fullWidth
                  size="small"
                  placeholder="Search functions and fields..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <List dense>
                  {getFilteredItems().map((item: any) => (
                    <FunctionItem
                      key={item.name}
                      button
                      onClick={() => handleItemClick(item)}
                    >
                      {item.isField ? (
                        <ListItemText
                          primary={
                            <Box>
                              <Typography variant="subtitle2" component="span">
                                Field: {item.name} ({item.description.replace('Type: ', '')})
                              </Typography>
                            </Box>
                          }
                        />
                      ) : (
                        <ListItemText
                          primary={
                            <FunctionDescription>
                              <Typography className="function-signature" variant="subtitle2">
                                {item.name}({item.params.map((p: FunctionParam) => {
                                  const dataType = Array.isArray(p.dataType) ? p.dataType.join(' | ') : p.dataType;
                                  return `${p.name}: ${dataType}`;
                                }).join(', ')}) → {item.returnType}
                              </Typography>
                              {item.description && (
                                <Typography className="function-description" variant="body2">
                                  {item.description}
                                </Typography>
                              )}
                            </FunctionDescription>
                          }
                        />
                      )}
                    </FunctionItem>
                  ))}
                </List>
              </FunctionList>
            </FunctionPanel>
          </EditorContent>
        </EditorContainer>
      </Drawer>
    </>
  );
} 