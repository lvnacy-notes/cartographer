---
title: Getting Started
description: How to install and use Cartographer
---

## Installation

Install the plugin using your preferred package manager:
```bash
npm install your-plugin
```

## Basic Usage

Import and use the plugin:
```typescript
import { yourFunction } from 'your-plugin';

const result = yourFunction({
  option1: 'value',
  option2: true,
});
```

## Configuration

Configure the plugin by passing options:
```typescript
import { configure } from 'your-plugin';

configure({
  theme: 'dark',
  verbose: true,
});
```

## Next Steps

- Check out the [API Reference](/reference/api)
- View [example components](/storybook)