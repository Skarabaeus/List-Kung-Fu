class AppController < ApplicationController

	before_filter :authenticate_user!, :except => [ :welcome ]

  def main
    render :layout => "application_main"
  end

  def welcome
    redirect_to :action => :main if user_signed_in?
  end

  def redirect
  end

end
