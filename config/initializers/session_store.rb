# Be sure to restart your server when you modify this file.

#ListKungFu::Application.config.session_store :cookie_store, :key => '_ListKungFu_session'

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
ListKungFu::Application.config.session_store :active_record_store

#require 'action_dispatch/middleware/session/dalli_store'
#Rails.application.config.session_store :dalli_store, :namespace => 'sessions', :key => '_ListKungFu_session', :expire_after => 30.minutes
