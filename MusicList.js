package com.ratingrocker.httpwww.ratingrockerapp;

import android.support.annotation.Nullable;
import android.support.v4.app.Fragment;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ExpandableListView;
//import android.content.Context;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class MusicList extends Fragment {
    private ExpandableListView listView;
    private ExpandableListAdaptor listAdapter;

    private List<String> listDataHeader;
    private HashMap<String, List<String>> listHash;
    @Override
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view= inflater.inflate(R.layout.activity_main2, container, false);

        listView = (ExpandableListView) view.findViewById(R.id.playlists);
        initData();
        listAdapter = new ExpandableListAdaptor(this,listDataHeader,listHash);
        listView.setAdapter(listAdapter);
        return view;
    }


    private void initData(){
        listDataHeader = new ArrayList<>();
        listHash = new HashMap<>();
        listDataHeader.add("UWP");

        List<String> uwp = new ArrayList<>();
        uwp.add( "ewvewrev");
        uwp.add("gewrev");
        uwp.add("grev");
        listHash.put(listDataHeader.get(0),uwp);
    }
}
