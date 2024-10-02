SportDB
=======

See: https://github.com/openfootball

```
docker build -t sportdb-image .
mkdir ~/footy
docker run -it -v ~/footy:/app sportdb-image new worldcup
```

This creates the `~/footy/sport.db` SQLite DB.
You can use ex [sqlitebrowser](https://sqlitebrowser.org/dl/) to open the .db file.
