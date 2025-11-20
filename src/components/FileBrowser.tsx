'use client';

import { useState, useMemo, useTransition } from 'react';
import { 
  AppBar, Toolbar, Typography, Container, Paper, TextField, 
  IconButton, List, ListItem, ListItemText, ListItemAvatar, 
  Avatar, Chip, Dialog, DialogTitle, DialogContent, 
  DialogActions, Button, Fab, Box, InputAdornment
} from '@mui/material';
import { 
  Search as SearchIcon, 
  InsertDriveFile as FileIcon, 
  Edit as EditIcon,
  CloudQueue as CloudIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { FileData, saveFileNote } from '@/app/actions';

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function FileBrowser({ initialFiles }: { initialFiles: FileData[] }) {
  // 实际项目中可以使用 useEffect + API 更新，这里简化为直接使用传入的 props
  const [files] = useState<FileData[]>(initialFiles); 
  const [search, setSearch] = useState('');
  const [editingFile, setEditingFile] = useState<FileData | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [isPending, startTransition] = useTransition();

  // 过滤逻辑
  const filteredFiles = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return files.filter(f => 
      f.key.toLowerCase().includes(lowerSearch) || 
      (f.note && f.note.toLowerCase().includes(lowerSearch))
    );
  }, [files, search]);

  const handleEditClick = (e: React.MouseEvent, file: FileData) => {
    e.preventDefault(); // 防止触发下载链接
    setEditingFile(file);
    setNoteInput(file.note || '');
  };

  const handleSave = () => {
    if (!editingFile) return;
    startTransition(async () => {
      await saveFileNote(editingFile.key, noteInput);
      // 乐观更新 UI
      editingFile.note = noteInput;
      setEditingFile(null);
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', pb: 4 }}>
      {/* 顶部导航栏 (MD3 Elevation 0 + Surface Color) */}
      <AppBar position="sticky" color="default" elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          <CloudIcon sx={{ mr: 2, color: '#1976d2' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600, color: '#333' }}>
            R2 存储
          </Typography>
          <Chip label={`${filteredFiles.length} 个文件`} size="small" />
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        {/* 搜索框 (MD3 Pill Shape) */}
        <Paper
          elevation={0}
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            mb: 3,
            borderRadius: '50px',
            bgcolor: '#fff',
            border: '1px solid #e0e0e0',
            transition: 'box-shadow 0.3s',
            '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }
          }}
        >
          <IconButton sx={{ p: '10px' }} aria-label="search">
            <SearchIcon />
          </IconButton>
          <TextField
            sx={{ ml: 1, flex: 1, "& fieldset": { border: 'none' } }}
            placeholder="搜索文件或备注..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
                endAdornment: search ? (
                    <InputAdornment position="end">
                        <IconButton onClick={() => setSearch('')} size="small"><CloseIcon fontSize="small"/></IconButton>
                    </InputAdornment>
                ) : null
            }}
          />
        </Paper>

        {/* 文件列表 */}
        <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #eee' }}>
          <List sx={{ p: 0 }}>
            {filteredFiles.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center', color: '#666' }}>未找到相关文件</Box>
            ) : (
              filteredFiles.map((file, index) => (
                <div key={file.key}>
                  <ListItem
                    alignItems="flex-start"
                    disablePadding
                    sx={{
                        '&:hover': { bgcolor: '#f5f9ff' },
                        transition: 'background-color 0.2s'
                    }}
                    secondaryAction={
                      <IconButton edge="end" onClick={(e) => handleEditClick(e, file)} sx={{ color: '#666' }}>
                        <EditIcon />
                      </IconButton>
                    }
                  >
                    <Box 
                        component="a" 
                        href={file.url} 
                        target="_blank" 
                        sx={{ 
                            display: 'flex', 
                            width: '100%', 
                            textDecoration: 'none', 
                            color: 'inherit',
                            p: 2,
                            pr: 6 // 留出右侧按钮空间
                        }}
                    >
                        <ListItemAvatar>
                            <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1565c0' }}>
                                <FileIcon />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#1a1a1a', wordBreak: 'break-all' }}>
                                        {file.key}
                                    </Typography>
                                    {file.note && (
                                        <Chip 
                                            label={file.note} 
                                            size="small" 
                                            color="primary" 
                                            variant="filled" 
                                            sx={{ height: 20, fontSize: '0.75rem', borderRadius: 1 }} 
                                        />
                                    )}
                                </Box>
                            }
                            secondary={
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    {formatBytes(file.size)} · {new Date(file.lastModified).toLocaleString()}
                                </Typography>
                            }
                        />
                    </Box>
                  </ListItem>
                  {index < filteredFiles.length - 1 && <Box sx={{ borderBottom: '1px solid #f0f0f0', ml: 9 }} />}
                </div>
              ))
            )}
          </List>
        </Paper>
      </Container>

      {/* 备注弹窗 */}
      <Dialog 
        open={!!editingFile} 
        onClose={() => setEditingFile(null)} 
        fullWidth 
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>编辑备注</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2, wordBreak: 'break-all' }}>
            {editingFile?.key}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="输入备注内容"
            type="text"
            fullWidth
            variant="outlined"
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditingFile(null)} sx={{ borderRadius: 4, color: '#666' }}>取消</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disableElevation 
            disabled={isPending}
            sx={{ borderRadius: 4 }}
          >
            {isPending ? '保存中...' : '保存'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}