package com.ratingrocker.httpwww.ratingrockerapp;
// TutorialApp
// Created by Spotify on 25/02/14.
// Copyright (c) 2014 Spotify. All rights reserved.


import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;

import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Bundle;
import android.util.Log;

import android.view.View;
//import android.widget.ExpandableListView;
// import android.widget.ScrollView;
import android.widget.CheckBox;
import android.widget.TextView;
import android.widget.SeekBar;

//import android.widget.Toast;

//import android.widget.Toast;
import com.spotify.sdk.android.authentication.AuthenticationClient;
import com.spotify.sdk.android.authentication.AuthenticationRequest;
import com.spotify.sdk.android.authentication.AuthenticationResponse;
import com.spotify.sdk.android.player.Config;
import com.spotify.sdk.android.player.ConnectionStateCallback;
import com.spotify.sdk.android.player.Connectivity;
import com.spotify.sdk.android.player.Error;
import com.spotify.sdk.android.player.Metadata;
import com.spotify.sdk.android.player.Player;
import com.spotify.sdk.android.player.PlaybackState;
import com.spotify.sdk.android.player.PlayerEvent;
import com.spotify.sdk.android.player.Spotify;
import com.spotify.sdk.android.player.SpotifyPlayer;

//import java.util.ArrayList;
//import java.util.HashMap;
//import java.util.List;


public class MainActivity extends Activity implements
        SpotifyPlayer.NotificationCallback, ConnectionStateCallback {

    // TODO: Replace with your client ID
    private static final String CLIENT_ID = "d570917696114c588cc8e1b302d801ed";
    // TODO: Replace with your redirect URI
    private static final String REDIRECT_URI = "rating-rocker-login://callback";



    // Request code that will be used to verify if the result comes from correct activity
    // Can be any integer
    private static final int REQUEST_CODE = 1337;

    private Player mPlayer;
    private TextView mMetadataText, freshView, chillView, partyView, studyView, mplaylist;
    private PlaybackState mCurrentPlaybackState;
    private BroadcastReceiver mNetworkStateReceiver;
    private static final String TAG = "Mymessages";
    private Metadata mMetadata;
    private CheckBox rap, alt, rock, fuck, edm;
    private SeekBar partyseek, chillseek, studyseek, freshseek;
    MyDBHandler db;
    // private TextView mStatusText;
    //private EditText mSeekEditText;
    //private ScrollView mStatusTextScrollView;
    /*

    };

*/
    private final Player.OperationCallback mOperationCallback = new Player.OperationCallback() {
        @Override
        public void onSuccess() {
            Log.i(TAG, "OK!");
        }

        @Override
        public void onError(Error error) {
            Log.i(TAG,"ERROR:" + error);
        }

    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mMetadataText = (TextView) findViewById(R.id.metadata);
        mplaylist = (TextView) findViewById(R.id.metadatas);
        db = new MyDBHandler(this);
        partyseek = (SeekBar) findViewById(R.id.partyseekBar);
        partyView = (TextView) findViewById(R.id.PartyvibevalText);
        chillseek = (SeekBar) findViewById(R.id.chillseekBar);
        chillView = (TextView) findViewById(R.id.chillvibevalText);
        studyseek = (SeekBar) findViewById(R.id.studyseekBar);
        studyView = (TextView) findViewById(R.id.studyvibevalText);
        freshseek = (SeekBar) findViewById(R.id.freshseekBar);
        freshView = (TextView) findViewById(R.id.freshnessvalText);
        AuthenticationRequest.Builder builder = new AuthenticationRequest.Builder(CLIENT_ID,
                AuthenticationResponse.Type.TOKEN,
                REDIRECT_URI);
        builder.setScopes(new String[]{"user-read-private", "playlist-read", "playlist-read-private", "streaming"});
        AuthenticationRequest request = builder.build();

        AuthenticationClient.openLoginActivity(this, REQUEST_CODE, request);
    }
    @Override
    protected void onResume() {
        super.onResume();
        // Set up the broadcast receiver for network events. Note that we also unregister
        // this receiver again in onPause().
        mNetworkStateReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (mPlayer != null) {
                    Connectivity connectivity = getNetworkConnectivity(getBaseContext());
                    mPlayer.setConnectivityStatus(mOperationCallback, connectivity);
                }
            }
        };
        IntentFilter filter = new IntentFilter(ConnectivityManager.CONNECTIVITY_ACTION);
        registerReceiver(mNetworkStateReceiver, filter);

        if (mPlayer != null) {
            mPlayer.addNotificationCallback(MainActivity.this);
            mPlayer.addConnectionStateCallback(MainActivity.this);
        }
    }
    private Connectivity getNetworkConnectivity(Context context) {
        ConnectivityManager connectivityManager;
        connectivityManager = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetwork = connectivityManager.getActiveNetworkInfo();
        if (activeNetwork != null && activeNetwork.isConnected()) {
            return Connectivity.fromNetworkType(activeNetwork.getType());
        } else {
            return Connectivity.OFFLINE;
        }
    }
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent intent) {
        super.onActivityResult(requestCode, resultCode, intent);

        // Check if result comes from the correct activity
        if (requestCode == REQUEST_CODE) {
            AuthenticationResponse response = AuthenticationClient.getResponse(resultCode, intent);
            if (response.getType() == AuthenticationResponse.Type.TOKEN) {
                Config playerConfig = new Config(this, response.getAccessToken(), CLIENT_ID);
                Spotify.getPlayer(playerConfig, this, new SpotifyPlayer.InitializationObserver() {
                    @Override
                    public void onInitialized(SpotifyPlayer spotifyPlayer) {
                        mPlayer = spotifyPlayer;
                        mPlayer.addConnectionStateCallback(MainActivity.this);
                        mPlayer.addNotificationCallback(MainActivity.this);
                        updateView();
                    }
                    @Override
                    public void onError(Throwable throwable) {
                        Log.e("MainActivity", "Could not initialize player: " + throwable.getMessage());
                    }
                });
            }
        }
    }

    private void updateView() {
        mMetadata = mPlayer.getMetadata();
        partyseek.setProgress(10);
        partyView.setText("10");
        chillseek.setProgress(10);
        studyseek.setProgress(10);
        freshseek.setProgress(10);
        chillView.setText("10");
        studyView.setText("10");
        freshView.setText("10");

            if (mMetadata != null && mMetadata.currentTrack != null) {
                mplaylist.setText(mMetadata.contextName);
                mMetadataText.setText( mMetadata.currentTrack.name + " - "
                        + mMetadata.currentTrack.artistName);
/*

*/
            } else {
                mMetadataText.setText("<nothing is playing>");
                //coverArtView.setBackground(null);
            }
        }
     /*Commands for playback */


    public void onTrackButtonClicked(View view) {

        mPlayer.playUri(mOperationCallback, "spotify:track:5glXTXNIkUMLIDJVMEBLFQ", 0, 0);
        //updateView();

    }
    public void onAlbumButtonClicked(View view) {

        String uri = mMetadata.contextUri;
        String newuri = "";
        String uri1 = "spotify:user:1221015148:playlist:5uRhVWWbmRz9LDgHlb95JT";
        String uri2 = "spotify:user:spotify:playlist:37i9dQZF1DX0FgqHNUrZu9";
        String uri3 = "spotify:user:1221015148:playlist:5AEuJGeKUU12V6h5EoskYD";
        String uri4 = "spotify:user:djbkaye:playlist:2AcH9skrLqwuTZqO4kmJDw";
        String uri5 = "spotify:user:spotify:playlist:37i9dQZEVXcPKy0U2e7eN5";
        String uri6 = "spotify:user:1221015148:playlist:5uRhVWWbmRz9LDgHlb95JT";
        if (!uri.equals(uri1)){
            if(!uri.equals(uri2)){
                if(!uri.equals(uri3)){
                    if(!uri.equals(uri4)) {
                        if (!uri.equals(uri5)) {
                            newuri = uri1;
                        } else {newuri = uri6;}
                    }else{ newuri = uri5;}
                }else{ newuri = uri4;}
            }else{ newuri = uri3;}
        }else{ newuri = uri2;}

        mPlayer.playUri(mOperationCallback, newuri, 0, 0);
       // updateView();

    }

    public void onPlaylistButtonClicked(View view) {

        mPlayer.playUri(mOperationCallback, "spotify:user:spotify:playlist:37i9dQZF1E9G8oeYG9uL66", 0, 0);

    }


    public void onPauseButtonClicked(View view) {
        if (mCurrentPlaybackState != null && mCurrentPlaybackState.isPlaying) {
            mPlayer.pause(mOperationCallback);
        } else {
            mPlayer.resume(mOperationCallback);
        }
    }

    public void onSkipToPreviousButtonClicked(View view) {
        mPlayer.skipToPrevious(mOperationCallback);

    }

    public void onSkipToNextButtonClicked(View view) {
        mPlayer.skipToNext(mOperationCallback);

    }

    public void onQueueSongButtonClicked(View view) {
        mPlayer.queue(mOperationCallback, "spotify:track:2ms1w53aIRN2nrQsedUua4" );

    }

    public void onToggleShuffleButtonClicked(View view) {
        mPlayer.setShuffle(mOperationCallback, true);

    }

    public void onToggleRepeatButtonClicked(View view) {
        mPlayer.setRepeat(mOperationCallback, !mCurrentPlaybackState.isRepeating);
    }
    public void onGClicked(View view){


    }

    public void onSaveButtonClicked(View view) {

        partyView.setText(String.valueOf(partyseek.getProgress()));
        chillView.setText(String.valueOf(chillseek.getProgress()));
        studyView.setText(String.valueOf(studyseek.getProgress()));
        freshView.setText(String.valueOf(freshseek.getProgress()));
        mMetadata = mPlayer.getMetadata();
        String songname = mMetadata.currentTrack.name;
        String songidd = mMetadata.currentTrack.uri;

        int freshval = freshseek.getProgress();
        if (chillseek.getProgress() > 60){
            int chillval = chillseek.getProgress();
            Vibedata newsong = new Vibedata(chillval, songidd, songname, 2, freshval);
            db.addnewrating(newsong);
            db.getrequestlist(70, 90, 0, 100);
            //db.databaseToString();

        }
        /*
        if (studyval > 60){
            Vibedata song = new Vibedata(studyval, songid, songname, 2, freshval);
            db.addVibetwosong(song);
            db.databaseToString();
            return;
        }
        if (partyval > 60){
            Vibedata song = new Vibedata(partyval, songid, songname, 2, freshval);
            db.addVibethreesong(song);
            db.databaseToString();
            return;
        }
*/
    }

    /*public void onSeekButtonClicked(View view) {
        final Integer seek = Integer.valueOf(mSeekEditText.getText().toString());
        mPlayer.seekToPosition(mOperationCallback, seek);
    }*/
    @Override
    protected void onDestroy() {
        // VERY IMPORTANT! This must always be called or else you will leak resources
        Spotify.destroyPlayer(this);
        super.onDestroy();
    }

    @Override
    public void onPlaybackEvent(PlayerEvent playerEvent) {
        Log.d("MainActivity", "Playback event received: " + playerEvent.name());
        switch (playerEvent) {

            case kSpPlaybackNotifyPlay:
                break;
            case kSpPlaybackNotifyPause:
                break;
            case kSpPlaybackNotifyTrackChanged:
                mCurrentPlaybackState = mPlayer.getPlaybackState();
                mMetadata = mPlayer.getMetadata();
                Log.e(TAG, "Player state: " + mCurrentPlaybackState);
                Log.e(TAG, "Metadata: " + mMetadata);
                updateView();
                break;

            case kSpPlaybackNotifyNext:
                break;
            case kSpPlaybackNotifyPrev:
                break;
            case kSpPlaybackNotifyShuffleOn:
                break;
            case kSpPlaybackNotifyShuffleOff:
                break;
            case kSpPlaybackNotifyRepeatOn:
                break;
            case kSpPlaybackNotifyRepeatOff:
                break;
            case kSpPlaybackNotifyBecameActive:
                break;
            case kSpPlaybackNotifyBecameInactive:
                break;
            case kSpPlaybackNotifyLostPermission:
                break;
            case kSpPlaybackEventAudioFlush:
                break;
            case kSpPlaybackNotifyAudioDeliveryDone:
                break;
            case kSpPlaybackNotifyContextChanged:
                break;
            case kSpPlaybackNotifyTrackDelivered:
                break;
            case kSpPlaybackNotifyMetadataChanged:

                break;

            default:

                break;
        }

    }

    @Override
    public void onPlaybackError(Error error) {
        Log.d("MainActivity", "Playback error received: " + error.name());
        switch (error) {
            // Handle error type as necessary
            default:
                break;
        }
    }

    @Override
    public void onLoggedIn() {
        Log.d("MainActivity", "User logged in");
        mPlayer.playUri(null, "spotify:user:spotify:playlist:37i9dQZF1E9G8oeYG9uL66", 0, 0);
        // mPlayer.playUri(null, "spotify:track:2TpxZ7JUBn3uw46aR7qd6V", 0, 0);
    }

    @Override
    public void onLoginFailed(Error error) {
        Log.d("MainActivity", "Login failed");
    }

    @Override
    public void onLoggedOut() {
        Log.d("MainActivity", "User logged out");
    }
    @Override
    public void onTemporaryError() {
        Log.d("MainActivity", "Temporary error occurred");
    }

    @Override
    public void onConnectionMessage(String message) {
        Log.d("MainActivity", "Received connection message: " + message);
    }


}
