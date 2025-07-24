import createElement from '../lib/createElement.js';


// Composant Button réutilisable
export function Button({ 
  text = 'Button', 
  onClick = () => {}, 
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  icon = null,
  ...props 
}) {
  const variants = {
    primary: { backgroundColor: '#4730dc', color: 'white' },
    secondary: { backgroundColor: '#ccc', color: '#333' },
    success: { backgroundColor: '#4caf50', color: 'white' },
    danger: { backgroundColor: '#f44336', color: 'white' },
    warning: { backgroundColor: '#ff9800', color: 'white' }
  };

  const sizes = {
    small: { padding: '6px 12px', fontSize: '12px' },
    medium: { padding: '10px 20px', fontSize: '14px' },
    large: { padding: '14px 28px', fontSize: '16px' }
  };

  const baseStyles = {
    border: 'none',
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: icon ? '8px' : '0',
    opacity: disabled ? '0.6' : '1',
    ...sizes[size],
    ...variants[variant]
  };

  return createElement(
    'button',
    {
      type,
      disabled,
      style: { ...baseStyles, ...props.style },
      ...props
    },
    ...(icon ? [icon, text] : [text])
  );
}

// Composant Input réutilisable

export function Input({ 
  label = '', 
  type = 'text', 
  placeholder = '', 
  required = false,
  value = '',
  onChange = () => {},
  error = null,
  ...props 
}) {
  const inputId = `input-${Math.random().toString(36).substr(2, 9)}`;

  return createElement(
    'div',
    { style: { marginBottom: '15px' } },
    label && createElement(
      'label',
      { 
        htmlFor: inputId,
        style: { 
          display: 'block', 
          marginBottom: '5px', 
          fontWeight: 'bold',
          color: error ? '#f44336' : '#333'
        }
      },
      label + (required ? ' *' : '')
    ),
    createElement('input', {
      type,
      id: inputId,
      placeholder,
      required,
      value,
      style: {
        width: '100%',
        padding: '10px',
        border: `1px solid ${error ? '#f44336' : '#ddd'}`,
        borderRadius: '4px',
        boxSizing: 'border-box',
        fontSize: '14px',
        ...props.style
      },
      ...props
    }),
    error && createElement(
      'div',
      { 
        style: { 
          color: '#f44336', 
          fontSize: '12px', 
          marginTop: '5px' 
        }
      },
      error
    )
  );
}


// Composant Textarea réutilisable
export function Textarea({ 
  label = '', 
  placeholder = '', 
  required = false,
  rows = 4,
  value = '',
  onChange = () => {},
  error = null,
  ...props 
}) {
  const textareaId = `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return createElement(
    'div',
    { style: { marginBottom: '15px' } },
    label && createElement(
      'label',
      { 
        htmlFor: textareaId,
        style: { 
          display: 'block', 
          marginBottom: '5px', 
          fontWeight: 'bold',
          color: error ? '#f44336' : '#333'
        }
      },
      label + (required ? ' *' : '')
    ),
    createElement('textarea', {
      id: textareaId,
      placeholder,
      required,
      rows,
      value,
      style: {
        width: '100%',
        padding: '10px',
        border: `1px solid ${error ? '#f44336' : '#ddd'}`,
        borderRadius: '4px',
        boxSizing: 'border-box',
        resize: 'vertical',
        fontSize: '14px',
        fontFamily: 'inherit',
        ...props.style
      },
      ...props
    }),
    error && createElement(
      'div',
      { 
        style: { 
          color: '#f44336', 
          fontSize: '12px', 
          marginTop: '5px' 
        }
      },
      error
    )
  );
}

// Composant Select réutilisable
export function Select({ 
  label = '', 
  required = false,
  value = '',
  onChange = () => {},
  options = [],
  placeholder = 'Sélectionner...',
  error = null,
  ...props 
}) {
  const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;

  return createElement(
    'div',
    { style: { marginBottom: '15px' } },
    label && createElement(
      'label',
      { 
        htmlFor: selectId,
        style: { 
          display: 'block', 
          marginBottom: '5px', 
          fontWeight: 'bold',
          color: error ? '#f44336' : '#333'
        }
      },
      label + (required ? ' *' : '')
    ),
    createElement(
      'select',
      {
        id: selectId,
        required,
        value,
        style: {
          width: '100%',
          padding: '10px',
          border: `1px solid ${error ? '#f44336' : '#ddd'}`,
          borderRadius: '4px',
          boxSizing: 'border-box',
          fontSize: '14px',
          backgroundColor: 'white',
          ...props.style
        },
        ...props
      },
      createElement('option', { value: '' }, placeholder),
      ...options.map(option => 
        createElement(
          'option', 
          { value: option.value }, 
          option.label
        )
      )
    ),
    error && createElement(
      'div',
      { 
        style: { 
          color: '#f44336', 
          fontSize: '12px', 
          marginTop: '5px' 
        }
      },
      error
    )
  );
}

// Composant Card réutilisable
export function Card({ 
  title = '', 
  children = [], 
  className = '',
  onClick = null,
  style = {},
  ...props 
}) {
  const baseStyles = {
    border: '1px solid #e1e1e1',
    borderRadius: '8px',
    padding: '16px',
    margin: '8px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'transform 0.2s, box-shadow 0.2s',
    ...style
  };

  const events = onClick ? {
    click: [onClick],
    mouseenter: [(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
    }],
    mouseleave: [(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    }]
  } : {};

  return createElement(
    'div',
    {
      class: className,
      style: baseStyles,
      events,
      ...props
    },
    title && createElement(
      'h3',
      { 
        style: { 
          margin: '0 0 12px 0', 
          color: '#333', 
          fontSize: '18px' 
        }
      },
      title
    ),
    ...children
  );
}

// Composant Loading Spinner
export function LoadingSpinner({ 
  size = '40px', 
  color = '#4730dc',
  message = 'Chargement...',
  style = {} 
}) {
  return createElement(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        ...style
      }
    },
    createElement('div', {
      style: {
        width: size,
        height: size,
        border: `3px solid ${color}20`,
        borderTop: `3px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '10px'
      }
    }),
    createElement(
      'p',
      { 
        style: { 
          margin: '0', 
          color: '#666', 
          fontSize: '14px' 
        }
      },
      message
    )
  );
}


// Composant Badge
export function Badge({ 
  text = '',
  variant = 'primary',
  size = 'small',
  style = {} 
}) {
  const variants = {
    primary: { backgroundColor: '#e3f2fd', color: '#1976d2' },
    success: { backgroundColor: '#e8f5e8', color: '#2e7d32' },
    warning: { backgroundColor: '#fff3e0', color: '#e65100' },
    danger: { backgroundColor: '#ffebee', color: '#d32f2f' },
    info: { backgroundColor: '#e1f5fe', color: '#0277bd' }
  };

  const sizes = {
    small: { padding: '4px 8px', fontSize: '11px' },
    medium: { padding: '6px 12px', fontSize: '12px' },
    large: { padding: '8px 16px', fontSize: '14px' }
  };

  return createElement(
    'span',
    {
      style: {
        borderRadius: '12px',
        fontWeight: 'bold',
        display: 'inline-block',
        ...sizes[size],
        ...variants[variant],
        ...style
      }
    },
    text
  );
}

// Composant Button d'inscription à une communauté
export function CommunityJoinButton({ 
  communauteId,
  isSubscribed = false,
  onJoin = () => {},
  onLeave = () => {},
  disabled = false,
  loading = false,
  memberCount = 0,
  maxMembers = null,
  size = 'medium',
  ...props 
}) {
  const isFull = maxMembers && memberCount >= maxMembers;
  
  const handleClick = () => {
    if (loading || disabled) return;
    
    if (isSubscribed) {
      onLeave(communauteId);
    } else {
      onJoin(communauteId);
    }
  };

  const getButtonText = () => {
    if (loading) return '...';
    if (isSubscribed) return 'Se désinscrire';
    if (isFull) return 'Complet';
    return 'Rejoindre';
  };

  const getButtonVariant = () => {
    if (isSubscribed) return 'secondary';
    if (isFull) return 'warning';
    return 'primary';
  };

  const getButtonIcon = () => {
    if (loading) return '⏳';
    if (isSubscribed) return '✓';
    if (isFull) return '🚫';
    return '+';
  };

  return Button({
    text: getButtonText(),
    icon: getButtonIcon(),
    onClick: handleClick,
    variant: getButtonVariant(),
    size,
    disabled: disabled || loading || (isFull && !isSubscribed),
    style: {
      minWidth: '120px',
      ...props.style
    },
    ...props
  });
}

// Composant Modal
export function Modal({ 
  title = '',
  children = [],
  isOpen = false,
  onClose = () => {},
  maxWidth = '500px',
  ...props 
}) {
  if (!isOpen) return null;

  return createElement(
    'div',
    {
      style: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '1000'
      },
      events: {
        click: [(e) => {
          if (e.target === e.currentTarget) onClose();
        }]
      }
    },
    createElement(
      'div',
      {
        style: {
          background: 'white',
          padding: '30px',
          borderRadius: '8px',
          width: '90%',
          maxWidth,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        },
        ...props
      },
      createElement(
        'div',
        {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }
        },
        createElement(
          'h2',
          { style: { margin: '0', color: '#333' } },
          title
        ),
        Button({
          text: '×',
          onClick: onClose,
          variant: 'secondary',
          style: {
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#999',
            padding: '0',
            width: '30px',
            height: '30px'
          }
        })
      ),
      createElement(
        'div',
        { class: 'modal-body' },
        ...children
      )
    )
  );
}
