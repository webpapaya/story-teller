# Starting infrastructure

```
ENV_FILE=.env.dev npm run infrastructure:up
ENV_FILE=.env.dev npm run infrastructure:down
```

# Running migrations

```
ENV_FILE=.env.dev npm run db:migration:up
ENV_FILE=.env.dev npm run db:migration:down
ENV_FILE=.env.dev npm run db:migration:create -- <<name_of_migration>>
```
