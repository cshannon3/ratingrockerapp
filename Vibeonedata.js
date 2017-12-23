package com.ratingrocker.sqlitesample;



public class Vibeonedata {

    private int _id;
    private int _ratingval;
    private int _ratecount;
    private int _freshvalue;
    private int _songid;


    public Vibeonedata() {

    }

    public Vibeonedata(int _ratingval, int _songid, int _ratecount, int _freshvalue) {
        this._songid = _songid;
        this._ratingval = _ratingval;
        this._ratecount = _ratecount;
        this._freshvalue = _freshvalue;
    }

    public Vibeonedata(int _id, int _songid, int _ratingval, int _ratecount, int _freshvalue) {
        this._id = _id;
        this._songid = _songid;
        this._ratingval = _ratingval;
        this._ratecount = _ratecount;
        this._freshvalue = _freshvalue;
    }

    public int get_songid() {
        return _songid;
    }

    public void set_songid(int _songid) {
        this._songid = _songid;
    }

    public int get_id() {
        return _id;
    }

    public void set_id(int _id) {
        this._id = _id;
    }

    public int get_ratingval() {
        return _ratingval;
    }

    public void set_ratingval(int _ratingval) {
        this._ratingval = _ratingval;
    }

    public int get_ratecount() {
        return _ratecount;
    }

    public void set_ratecount(int _ratecount) {
        this._ratecount = _ratecount;
    }

    public int get_freshvalue() {
        return _freshvalue;
    }

    public void set_freshvalue(int _freshvalue) {
        this._freshvalue = _freshvalue;
    }
}
