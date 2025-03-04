---
title: '📊 Performance Report: {{ date | date("YYYY-MM-DD") }}'
labels: performance, monitoring
assignees: anaya-yorke
---

## Performance Monitoring Results

This automated report contains the latest performance metrics for The Edison.

### Lighthouse Scores

{{ env.LIGHTHOUSE_RESULTS }}

### Bundle Size Analysis

{{ env.BUNDLE_RESULTS }}

### Key Metrics

- First Contentful Paint (FCP): {{ env.FCP }}
- Largest Contentful Paint (LCP): {{ env.LCP }}
- Time to Interactive (TTI): {{ env.TTI }}
- Total Blocking Time (TBT): {{ env.TBT }}
- Cumulative Layout Shift (CLS): {{ env.CLS }}

### Recommendations

{{ env.PERFORMANCE_RECOMMENDATIONS }}

### Action Items

1. [ ] Review performance metrics
2. [ ] Address any scores below threshold
3. [ ] Implement recommended optimizations
4. [ ] Verify improvements in staging environment
5. [ ] Document optimizations made

### Useful Commands

```bash
# Analyze bundle size
npm run analyze

# Run lighthouse locally
npx lighthouse https://anaya-yorke.github.io/The-Edison --view

# Check browser compatibility
npx browserslist-ga
```

### Comparison with Previous Report

{{ env.PERFORMANCE_DIFF }}

### Additional Notes

- Performance monitoring conducted on: {{ date | date("YYYY-MM-DD HH:mm:ss") }}
- Environment: Production
- Test Location: {{ env.TEST_LOCATION }}

Please review these results and take necessary actions to maintain or improve performance. 