class AppController < ApplicationController

	before_filter :authenticate_user!, :except => [ :welcome ]

  def main
  end

  def welcome
  end

end
